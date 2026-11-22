"""
API REST FastAPI - Dashboard Caja de Ahorro (Enfoque Oaxaca).
Expone los 8 KPIs financieros y desgloses por género, trimestre y periodo.
"""

from __future__ import annotations

from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .db import engine

app = FastAPI(
    title="Horizonte Cooperativo API - Oaxaca",
    description="API de KPIs financieros de créditos ejercidos por género en Oaxaca (FONACOT 2025).",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _build_filters(
    anio: Optional[int],
    genero: Optional[str],
    *,
    only_oaxaca: bool = True,
    entidad: Optional[str] = None,
) -> tuple[str, dict]:
    clauses: list[str] = []
    params: dict = {}

    if only_oaxaca:
        clauses.append("es_oaxaca = TRUE")
    elif entidad:
        clauses.append("entidad_federativa = :entidad")
        params["entidad"] = entidad

    if anio is not None:
        clauses.append("anio = :anio")
        params["anio"] = anio
    if genero and genero.lower() != "todos":
        clauses.append("LOWER(genero) = LOWER(:genero)")
        params["genero"] = genero

    return (" AND ".join(clauses) if clauses else "TRUE"), params


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
                text(
                    "SELECT DISTINCT anio FROM creditos_entidad_genero "
                    "WHERE es_oaxaca = TRUE ORDER BY anio DESC"
                )
            )
        ]
        generos = [
            row[0]
            for row in conn.execute(
                text(
                    "SELECT DISTINCT genero FROM creditos_entidad_genero "
                    "WHERE es_oaxaca = TRUE ORDER BY genero"
                )
            )
        ]
    return {"anios": anios, "generos": generos}


@app.get("/api/kpis")
def get_kpis(
    anio: Optional[int] = Query(default=None),
    genero: Optional[str] = Query(default=None),
) -> dict:
    """Calcula los 8 KPIs principales para Oaxaca respetando los filtros activos."""
    where_sql, params = _build_filters(anio, genero, only_oaxaca=True)
    nac_where_sql, nac_params = _build_filters(
        anio, genero, only_oaxaca=False, entidad="Nacional"
    )

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

        # Crecimiento periodo vs. periodo respetando filtros:
        # - Si hay múltiples años en la selección, compara último año vs. año anterior.
        # - Si los datos corresponden a un solo año (ej. FONACOT 2025), compara último trimestre vs. anterior.
        anual = conn.execute(
            text(
                f"""
                SELECT anio, SUM(importe_ejercido_mxn) AS monto
                FROM creditos_entidad_genero
                WHERE {where_sql}
                GROUP BY anio
                ORDER BY anio DESC
                LIMIT 2
                """
            ),
            params,
        ).mappings().all()

        trimestral = conn.execute(
            text(
                f"""
                SELECT
                    anio,
                    CAST(CEIL(mes / 3.0) AS INTEGER) AS trimestre,
                    SUM(importe_ejercido_mxn) AS monto
                FROM creditos_entidad_genero
                WHERE {where_sql}
                GROUP BY anio, CAST(CEIL(mes / 3.0) AS INTEGER)
                ORDER BY anio DESC, trimestre DESC
                LIMIT 2
                """
            ),
            params,
        ).mappings().all()

        nacional_row = conn.execute(
            text(
                f"""
                SELECT COALESCE(SUM(importe_ejercido_mxn), 0) AS monto_nacional
                FROM creditos_entidad_genero
                WHERE {nac_where_sql}
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

    # Brecha de ticket por género: solo aplica si ambos géneros tienen créditos en la selección
    if mujer_cred > 0 and hombre_cred > 0:
        ticket_mujer = round(mujer_monto / mujer_cred, 2)
        ticket_hombre = round(hombre_monto / hombre_cred, 2)
        brecha_ticket_mxn: Optional[float] = round(ticket_hombre - ticket_mujer, 2)
    else:
        brecha_ticket_mxn = None

    crecimiento_pct = 0.0
    crecimiento_detalle = "Sin periodo previo para comparar"
    if len(anual) == 2 and float(anual[1]["monto"]) > 0:
        actual = float(anual[0]["monto"])
        anterior = float(anual[1]["monto"])
        crecimiento_pct = round(((actual - anterior) / anterior) * 100, 2)
        crecimiento_detalle = f"Interanual: {anual[0]['anio']} vs. {anual[1]['anio']}"
    elif len(trimestral) == 2 and float(trimestral[1]["monto"]) > 0:
        actual = float(trimestral[0]["monto"])
        anterior = float(trimestral[1]["monto"])
        crecimiento_pct = round(((actual - anterior) / anterior) * 100, 2)
        crecimiento_detalle = (
            f"Trimestral: {trimestral[0]['trimestre']}T {trimestral[0]['anio']} "
            f"vs. {trimestral[1]['trimestre']}T {trimestral[1]['anio']}"
        )

    monto_nacional = float(nacional_row["monto_nacional"])
    participacion_nacional_pct = (
        round((monto_total / monto_nacional) * 100, 2) if monto_nacional > 0 else 0.0
    )

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
            "crecimiento_detalle": crecimiento_detalle,
            "participacion_oaxaca_nacional_pct": participacion_nacional_pct,
        }
    }


@app.get("/api/genero")
def get_por_genero(anio: Optional[int] = Query(default=None)) -> dict:
    where_sql, params = _build_filters(anio, None, only_oaxaca=True)
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
    where_sql, params = _build_filters(anio, genero, only_oaxaca=True)
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


@app.get("/api/comparativa-nacional")
def get_comparativa_nacional(
    anio: Optional[int] = Query(default=None),
    genero: Optional[str] = Query(default=None),
) -> dict:
    """Compara el volumen y ticket promedio de Oaxaca frente al total Nacional."""
    oax_where, oax_params = _build_filters(anio, genero, only_oaxaca=True)
    nac_where, nac_params = _build_filters(
        anio, genero, only_oaxaca=False, entidad="Nacional"
    )

    with engine.connect() as conn:
        oax = conn.execute(
            text(
                f"""
                SELECT
                    COALESCE(SUM(numero_creditos), 0) AS creditos,
                    COALESCE(SUM(importe_ejercido_mxn), 0) AS monto_mxn
                FROM creditos_entidad_genero
                WHERE {oax_where}
                """
            ),
            oax_params,
        ).mappings().one()

        nac = conn.execute(
            text(
                f"""
                SELECT
                    COALESCE(SUM(numero_creditos), 0) AS creditos,
                    COALESCE(SUM(importe_ejercido_mxn), 0) AS monto_mxn
                FROM creditos_entidad_genero
                WHERE {nac_where}
                """
            ),
            nac_params,
        ).mappings().one()

    oax_cred = int(oax["creditos"])
    oax_monto = float(oax["monto_mxn"])
    nac_cred = int(nac["creditos"])
    nac_monto = float(nac["monto_mxn"])

    return {
        "oaxaca": {
            "creditos": oax_cred,
            "monto_mxn": round(oax_monto, 2),
            "ticket_promedio_mxn": round(oax_monto / oax_cred, 2) if oax_cred > 0 else 0.0,
        },
        "nacional": {
            "creditos": nac_cred,
            "monto_mxn": round(nac_monto, 2),
            "ticket_promedio_mxn": round(nac_monto / nac_cred, 2) if nac_cred > 0 else 0.0,
        },
        "participacion_creditos_pct": round((oax_cred / nac_cred) * 100, 2) if nac_cred > 0 else 0.0,
        "participacion_monto_pct": round((oax_monto / nac_monto) * 100, 2) if nac_monto > 0 else 0.0,
    }
