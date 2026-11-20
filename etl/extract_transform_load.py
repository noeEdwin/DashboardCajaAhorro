"""
Proceso ETL (Extract, Transform, Load) - Horizonte Cooperativo (Enfoque Oaxaca).

Fuente principal:
  datos.gob.mx - Trabajadores con crédito ejercido por género y entidad federativa (FONACOT).

Uso:
  python etl/extract_transform_load.py --input data/raw/sample_oaxaca_creditos.csv
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path
from typing import Dict

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

COLUMN_ALIASES: Dict[str, str] = {
    "anio": "anio",
    "año": "anio",
    "year": "anio",
    "mes": "mes",
    "month": "mes",
    "entidad": "entidad_federativa",
    "entidad_federativa": "entidad_federativa",
    "estado": "entidad_federativa",
    "genero": "genero",
    "género": "genero",
    "sexo": "genero",
    "trabajadores_con_credito": "numero_trabajadores",
    "trabajadores": "numero_trabajadores",
    "numero_trabajadores": "numero_trabajadores",
    "creditos_ejercidos": "numero_creditos",
    "creditos": "numero_creditos",
    "numero_creditos": "numero_creditos",
    "importe_ejercido_mxn": "importe_ejercido_mxn",
    "importe_ejercido": "importe_ejercido_mxn",
    "importe": "importe_ejercido_mxn",
    "monto": "importe_ejercido_mxn",
}


def extract_csv(csv_path: Path) -> pd.DataFrame:
    """Extrae datos crudos desde CSV detectando codificación UTF-8 o Latin-1."""
    if not csv_path.exists():
        raise FileNotFoundError(f"No se encontró el archivo CSV: {csv_path}")

    for encoding in ("utf-8", "latin-1"):
        try:
            df = pd.read_csv(csv_path, encoding=encoding)
            return df
        except UnicodeDecodeError:
            continue
    raise ValueError(f"No fue posible decodificar el archivo {csv_path}")


def normalize_gender(value: str) -> str:
    """Estandariza etiquetas de género."""
    text_val = str(value).strip().lower()
    if text_val.startswith(("m", "f")):
        if "masc" in text_val or text_val == "m":
            return "Hombre"
        return "Mujer"
    if "homb" in text_val:
        return "Hombre"
    return "No especificado"


def normalize_state(value: str) -> str:
    """Estandariza nombres de entidad federativa."""
    text_val = str(value).strip()
    if "oaxaca" in text_val.lower():
        return "Oaxaca"
    if "nacional" in text_val.lower() or "total" in text_val.lower():
        return "Nacional"
    return text_val.title()


def transform_data(raw_df: pd.DataFrame, keep_national: bool = True) -> pd.DataFrame:
    """Limpia, normaliza columnas, calcula fecha_corte y filtra Oaxaca (+ Nacional)."""
    renamed_cols = {}
    for col in raw_df.columns:
        key = col.strip().lower().replace(" ", "_")
        if key in COLUMN_ALIASES:
            renamed_cols[col] = COLUMN_ALIASES[key]

    df = raw_df.rename(columns=renamed_cols).copy()

    required = {"anio", "mes", "entidad_federativa", "genero", "importe_ejercido_mxn"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Faltan columnas requeridas en el CSV: {sorted(missing)}")

    if "numero_creditos" not in df.columns and "numero_trabajadores" in df.columns:
        df["numero_creditos"] = df["numero_trabajadores"]
    if "numero_trabajadores" not in df.columns and "numero_creditos" in df.columns:
        df["numero_trabajadores"] = df["numero_creditos"]

    df["anio"] = pd.to_numeric(df["anio"], errors="coerce").astype("Int64")
    df["mes"] = pd.to_numeric(df["mes"], errors="coerce").astype("Int64")
    df["numero_trabajadores"] = pd.to_numeric(df["numero_trabajadores"], errors="coerce").fillna(0).astype(int)
    df["numero_creditos"] = pd.to_numeric(df["numero_creditos"], errors="coerce").fillna(0).astype(int)
    df["importe_ejercido_mxn"] = (
        df["importe_ejercido_mxn"]
        .astype(str)
        .str.replace(r"[$,\s]", "", regex=True)
    )
    df["importe_ejercido_mxn"] = pd.to_numeric(df["importe_ejercido_mxn"], errors="coerce").fillna(0.0)

    df = df.dropna(subset=["anio", "mes", "entidad_federativa", "genero"])
    df["anio"] = df["anio"].astype(int)
    df["mes"] = df["mes"].astype(int)
    df = df[(df["mes"] >= 1) & (df["mes"] <= 12)]

    df["entidad_federativa"] = df["entidad_federativa"].apply(normalize_state)
    df["genero"] = df["genero"].apply(normalize_gender)
    df["es_oaxaca"] = df["entidad_federativa"] == "Oaxaca"

    if keep_national:
        df = df[df["entidad_federativa"].isin(["Oaxaca", "Nacional"])]
    else:
        df = df[df["es_oaxaca"]]

    df["fecha_corte"] = pd.to_datetime(
        df["anio"].astype(str) + "-" + df["mes"].astype(str).str.zfill(2) + "-01"
    ).dt.date
    df["fuente"] = "datos.gob.mx - FONACOT"

    grouped = (
        df.groupby(
            ["anio", "mes", "fecha_corte", "entidad_federativa", "es_oaxaca", "genero", "fuente"],
            as_index=False,
        )[["numero_trabajadores", "numero_creditos", "importe_ejercido_mxn"]]
        .sum()
    )
    return grouped


def load_to_postgres(df: pd.DataFrame, source_name: str, total_raw: int) -> int:
    """Carga los registros transformados a PostgreSQL con upsert idempotente."""
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql://horizonte:horizonte_pass@localhost:5432/caja_ahorro_oaxaca",
    )
    engine = create_engine(database_url)

    upsert_sql = text(
        """
        INSERT INTO creditos_entidad_genero (
            anio, mes, fecha_corte, entidad_federativa, es_oaxaca,
            genero, numero_trabajadores, numero_creditos, importe_ejercido_mxn, fuente
        )
        VALUES (
            :anio, :mes, :fecha_corte, :entidad_federativa, :es_oaxaca,
            :genero, :numero_trabajadores, :numero_creditos, :importe_ejercido_mxn, :fuente
        )
        ON CONFLICT (anio, mes, entidad_federativa, genero, fuente)
        DO UPDATE SET
            fecha_corte = EXCLUDED.fecha_corte,
            es_oaxaca = EXCLUDED.es_oaxaca,
            numero_trabajadores = EXCLUDED.numero_trabajadores,
            numero_creditos = EXCLUDED.numero_creditos,
            importe_ejercido_mxn = EXCLUDED.importe_ejercido_mxn;
        """
    )

    records = df.to_dict(orient="records")
    oaxaca_count = int(df["es_oaxaca"].sum())

    with engine.begin() as conn:
        if records:
            conn.execute(upsert_sql, records)
        conn.execute(
            text(
                """
                INSERT INTO etl_ejecuciones (
                    archivo_fuente, registros_leidos, registros_oaxaca,
                    registros_cargados, estado, mensaje
                )
                VALUES (:archivo, :leidos, :oaxaca, :cargados, :estado, :mensaje);
                """
            ),
            {
                "archivo": source_name,
                "leidos": total_raw,
                "oaxaca": oaxaca_count,
                "cargados": len(records),
                "estado": "EXITOSO",
                "mensaje": f"Carga completada para {len(records)} registros agregados.",
            },
        )
    return len(records)


def main() -> None:
    parser = argparse.ArgumentParser(description="ETL Oaxaca - Créditos por género y entidad")
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("data/raw/sample_oaxaca_creditos.csv"),
        help="Ruta al archivo CSV de entrada.",
    )
    parser.add_argument(
        "--only-oaxaca",
        action="store_true",
        help="Si se activa, omite los registros agregados de Nacional.",
    )
    args = parser.parse_args()

    raw_df = extract_csv(args.input)
    transformed_df = transform_data(raw_df, keep_national=not args.only_oaxaca)
    loaded = load_to_postgres(transformed_df, str(args.input), len(raw_df))
    print(f"ETL completado: {len(raw_df)} filas leídas -> {loaded} registros cargados en PostgreSQL.")


if __name__ == "__main__":
    main()
