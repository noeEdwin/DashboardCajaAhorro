"""
API REST FastAPI - Dashboard Caja de Ahorro (Enfoque Oaxaca).
Expone los 8 KPIs financieros y desgloses por género y periodo.
"""

from __future__ import annotations

from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .db import engine

app = FastAPI(
    title="Horizonte Cooperativo API - Oaxaca",
    description="API de KPIs financieros de créditos ejercidos por género en Oaxaca.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _build_filters(anio: Optional[int], genero: Optional[str]) -> tuple[str, dict]:
    clauses = ["es_oaxaca = TRUE"]
    params: dict = {}
    if anio is not None:
        clauses.append("anio = :anio")
        params["anio"] = anio
    if genero and genero.lower() != "todos":
        clauses.append("LOWER(genero) = LOWER(:genero)")
        params["genero"] = genero
    return " AND ".join(clauses), params


@app.get("/health")
def health_check() -> dict:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}


@app.get("/api/filtros")
def get_filtros() -> dict:
    with engine.connect() as conn:
        anios = [
            row[0]
            for row in conn.execute(
                text("SELECT DISTINCT anio FROM creditos_entidad_genero WHERE es_oaxaca = TRUE ORDER BY anio DESC")
            )
        ]
        generos = [
            row[0]
            for row in conn.execute(
                text("SELECT DISTINCT genero FROM creditos_entidad_genero WHERE es_oaxaca = TRUE ORDER BY genero")
            )
        ]
    return {"anios": anios, "generos": generos}


@app.get("/api/kpis")
def get_kpis(
    anio: Optional[int] = Query(default=None),
    genero: Optional[str] = Query(default=None),
) -> dict:
    """Calcula los 8 KPIs principales para Oaxaca."""
    where_sql, params = _build_filters(anio, genero)

    with engine.connect() as conn:
        totales = conn.execute(
            text(
                f"""
                SELECT
                    COALESCE(SUM(numero_trabajadores), 0) AS total_trabajadores,
                    COALESCE(SUM(numero_creditos), 0) AS total_creditos,
                    COALESCE(SUM(importe_ejercido_mxn), 0) AS monto_total_mxn
                FROM creditos_entidad_genero
                WHERE {where_sql}
                """
            ),
            params,
        ).mappings().one()

        por_genero = conn.execute(
            text(
                f"""
                SELECT
                    genero,
                    COALESCE(SUM(numero_creditos), 0) AS creditos,
                    COALESCE(SUM(importe_ejercido_mxn), 0) AS monto_mxn
                FROM creditos_entidad_genero
                WHERE {where_sql}
                GROUP BY genero
                """
            ),
            params,
        ).mappings().all()

        # Crecimiento anual (último año vs año anterior en Oaxaca)
        anual = conn.execute(
            text(
                """
                SELECT anio, SUM(importe_ejercido_mxn) AS monto
                FROM creditos_entidad_genero
                WHERE es_oaxaca = TRUE
                GROUP BY anio
                ORDER BY anio DESC
                LIMIT 2
                """
            )
        ).mappings().all()

        # Participación Oaxaca vs Nacional
        nac_where = "entidad_federativa = 'Nacional'" + (" AND anio = :anio" if anio is not None else "")
        nac_params = {"anio": anio} if anio is not None else {}
        nacional_row = conn.execute(
            text(
                f"""
                SELECT COALESCE(SUM(importe_ejercido_mxn), 0) AS monto_nacional
                FROM creditos_entidad_genero
                WHERE {nac_where}
                """
            ),
            nac_params,
        ).mappings().one()

    total_creditos = int(totales["total_creditos"])
    monto_total = float(totales["monto_total_mxn"])
    ticket_promedio = round(monto_total / total_creditos, 2) if total_creditos > 0 else 0.0

    genero_map = {row["genero"]: row for row in por_genero}
    mujer_cred = int(genero_map.get("Mujer", {}).get("creditos", 0))
    hombre_cred = int(genero_map.get("Hombre", {}).get("creditos", 0))
    mujer_monto = float(genero_map.get("Mujer", {}).get("monto_mxn", 0.0))
    hombre_monto = float(genero_map.get("Hombre", {}).get("monto_mxn", 0.0))

    pct_mujeres = round((mujer_cred / total_creditos) * 100, 2) if total_creditos > 0 else 0.0
    pct_hombres = round((hombre_cred / total_creditos) * 100, 2) if total_creditos > 0 else 0.0

    ticket_mujer = round(mujer_monto / mujer_cred, 2) if mujer_cred > 0 else 0.0
    ticket_hombre = round(hombre_monto / hombre_cred, 2) if hombre_cred > 0 else 0.0
    brecha_ticket_mxn = round(ticket_hombre - ticket_mujer, 2)

    crecimiento_pct = 0.0
    if len(anual) == 2 and float(anual[1]["monto"]) > 0:
        actual = float(anual[0]["monto"])
        anterior = float(anual[1]["monto"])
        crecimiento_pct = round(((actual - anterior) / anterior) * 100, 2)

    monto_nacional = float(nacional_row["monto_nacional"])
    participacion_nacional_pct = round((monto_total / monto_nacional) * 100, 2) if monto_nacional > 0 else 0.0

    return {
        "kpis": {
            "total_trabajadores": int(totales["total_trabajadores"]),
            "total_creditos": total_creditos,
            "monto_total_mxn": round(monto_total, 2),
            "ticket_promedio_mxn": ticket_promedio,
            "participacion_mujeres_pct": pct_mujeres,
            "participacion_hombres_pct": pct_hombres,
            "brecha_ticket_genero_mxn": brecha_ticket_mxn,
            "crecimiento_periodo_pct": crecimiento_pct,
            "participacion_oaxaca_nacional_pct": participacion_nacional_pct,
        }
    }


@app.get("/api/genero")
def get_por_genero(anio: Optional[int] = Query(default=None)) -> dict:
    where_sql, params = _build_filters(anio, None)
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                f"""
                SELECT
                    genero,
                    SUM(numero_trabajadores) AS trabajadores,
                    SUM(numero_creditos) AS creditos,
                    SUM(importe_ejercido_mxn) AS monto_mxn,
                    CASE WHEN SUM(numero_creditos) > 0
                        THEN ROUND(SUM(importe_ejercido_mxn) / SUM(numero_creditos), 2)
                        ELSE 0
                    END AS ticket_promedio_mxn
                FROM creditos_entidad_genero
                WHERE {where_sql}
                GROUP BY genero
                ORDER BY genero
                """
            ),
            params,
        ).mappings().all()
    return {"data": [dict(r) for r in rows]}


@app.get("/api/tendencia")
def get_tendencia(
    anio: Optional[int] = Query(default=None),
    genero: Optional[str] = Query(default=None),
) -> dict:
    where_sql, params = _build_filters(anio, genero)
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                f"""
                SELECT
                    anio,
                    mes,
                    TO_CHAR(fecha_corte, 'YYYY-MM') AS periodo,
                    genero,
                    SUM(numero_creditos) AS creditos,
                    SUM(importe_ejercido_mxn) AS monto_mxn
                FROM creditos_entidad_genero
                WHERE {where_sql}
                GROUP BY anio, mes, fecha_corte, genero
                ORDER BY anio, mes, genero
                """
            ),
            params,
        ).mappings().all()
    return {"data": [dict(r) for r in rows]}
