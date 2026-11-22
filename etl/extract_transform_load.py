"""
Proceso ETL (Extract, Transform, Load) - Horizonte Cooperativo (Enfoque Oaxaca).

Fuente principal:
  datos.gob.mx - Trabajadores con crédito ejercido e importe por género y entidad federativa (FONACOT 2025).

Uso recomendado (8 CSV oficiales en formato ancho de FONACOT):
  python etl/extract_transform_load.py --fonacot-dir data/raw

Uso alternativo (CSV en formato largo, ej. muestra):
  python etl/extract_transform_load.py --input data/raw/sample_oaxaca_creditos.csv
"""

from __future__ import annotations

import argparse
import os
import re
import unicodedata
from pathlib import Path
from typing import Dict

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

MONTH_MAP: Dict[str, int] = {
    "ene": 1,
    "feb": 2,
    "mar": 3,
    "abr": 4,
    "may": 5,
    "jun": 6,
    "jul": 7,
    "ago": 8,
    "sep": 9,
    "oct": 10,
    "nov": 11,
    "dic": 12,
}

STATE_CANONICAL: Dict[str, str] = {
    "aguascalientes": "Aguascalientes",
    "baja california": "Baja California",
    "baja california sur": "Baja California Sur",
    "campeche": "Campeche",
    "chiapas": "Chiapas",
    "chihuahua": "Chihuahua",
    "ciudad de mexico": "Ciudad de México",
    "cdmx": "Ciudad de México",
    "coahuila": "Coahuila",
    "coahuila de zaragoza": "Coahuila",
    "colima": "Colima",
    "durango": "Durango",
    "estado de mexico": "Estado de México",
    "mexico": "Estado de México",
    "guanajuato": "Guanajuato",
    "guerrero": "Guerrero",
    "hidalgo": "Hidalgo",
    "jalisco": "Jalisco",
    "michoacan": "Michoacán",
    "michoacan de ocampo": "Michoacán",
    "morelos": "Morelos",
    "nayarit": "Nayarit",
    "nuevo leon": "Nuevo León",
    "oaxaca": "Oaxaca",
    "puebla": "Puebla",
    "queretaro": "Querétaro",
    "quintana roo": "Quintana Roo",
    "san luis potosi": "San Luis Potosí",
    "sinaloa": "Sinaloa",
    "sonora": "Sonora",
    "tabasco": "Tabasco",
    "tamaulipas": "Tamaulipas",
    "tlaxcala": "Tlaxcala",
    "veracruz": "Veracruz",
    "veracruz de ignacio de la llave": "Veracruz",
    "yucatan": "Yucatán",
    "zacatecas": "Zacatecas",
    "app movil": "App Móvil",
    "nacional": "Nacional",
}

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

FONACOT_FILE_RE = re.compile(r"^fonacot_(montos|trabajadores)_(\d{4})T([1-4])\.csv$", re.IGNORECASE)


def _strip_accents(value: str) -> str:
    nfkd = unicodedata.normalize("NFKD", str(value))
    return "".join(ch for ch in nfkd if not unicodedata.combining(ch))


def normalize_state(value: str) -> str:
    """Estandariza nombres de entidad federativa (corrige variantes entre T1-T2 y T3-T4)."""
    clean = re.sub(r"\s+", " ", _strip_accents(value).strip().lower())
    if clean in STATE_CANONICAL:
        return STATE_CANONICAL[clean]
    if "oaxaca" in clean:
        return "Oaxaca"
    if "app" in clean and "movil" in clean:
        return "App Móvil"
    if "nacional" in clean or "total" in clean:
        return "Nacional"
    return str(value).strip().title()


def normalize_gender(value: str) -> str:
    """Estandariza etiquetas de género."""
    text_val = _strip_accents(str(value).strip().lower())
    if text_val.startswith("mujer") or text_val in ("f", "femenino"):
        return "Mujer"
    if text_val.startswith("hombre") or text_val in ("m", "masculino"):
        return "Hombre"
    return "No especificado"


def extract_csv(csv_path: Path) -> pd.DataFrame:
    """Extrae datos crudos desde CSV detectando codificación UTF-8 o Latin-1."""
    if not csv_path.exists():
        raise FileNotFoundError(f"No se encontró el archivo CSV: {csv_path}")

    for encoding in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            return pd.read_csv(csv_path, encoding=encoding, dtype=str)
        except UnicodeDecodeError:
            continue
    raise ValueError(f"No fue posible decodificar el archivo {csv_path}")


def _parse_numeric(series: pd.Series) -> pd.Series:
    cleaned = series.astype(str).str.replace(r"[$,\s]", "", regex=True)
    return pd.to_numeric(cleaned, errors="coerce").fillna(0.0)


def _melt_fonacot_wide(df: pd.DataFrame, anio: int, value_name: str) -> pd.DataFrame:
    """Convierte un CSV ancho de FONACOT (ene_mujeres, ene_hombres, ...) a formato largo."""
    col_entidad = next(
        (c for c in df.columns if c.strip().lower().replace(" ", "_") == "entidad_federativa"),
        df.columns[0],
    )
    mes_cols = [c for c in df.columns if re.match(r"^[a-z]{3}_(mujeres|hombres)$", c.strip().lower())]
    if not mes_cols:
        raise ValueError(f"No se encontraron columnas {{mes}}_{{mujeres|hombres}} en el CSV: {list(df.columns)}")

    subset = df[[col_entidad] + mes_cols].copy()
    subset = subset.rename(columns={col_entidad: "entidad_federativa"})
    subset["entidad_federativa"] = subset["entidad_federativa"].apply(normalize_state)

    melted = subset.melt(
        id_vars=["entidad_federativa"],
        value_vars=mes_cols,
        var_name="mes_genero",
        value_name=value_name,
    )
    parts = melted["mes_genero"].str.strip().str.lower().str.split("_", expand=True)
    melted["mes"] = parts[0].map(MONTH_MAP)
    melted["genero"] = parts[1].apply(normalize_gender)
    melted["anio"] = anio
    melted[value_name] = _parse_numeric(melted[value_name])

    melted = melted.dropna(subset=["mes"])
    melted["mes"] = melted["mes"].astype(int)
    return (
        melted.groupby(["anio", "mes", "entidad_federativa", "genero"], as_index=False)[value_name]
        .sum()
    )


def extract_and_transform_fonacot_dir(
    raw_dir: Path,
    keep_national: bool = True,
    keep_all_states: bool = False,
) -> tuple[pd.DataFrame, int, list[str]]:
    """Lee y une los pares de CSV oficiales FONACOT (trabajadores y montos por trimestre)."""
    if not raw_dir.exists():
        raise FileNotFoundError(f"No existe el directorio: {raw_dir}")

    pairs: Dict[tuple[int, int], Dict[str, Path]] = {}
    for file_path in sorted(raw_dir.glob("fonacot_*.csv")):
        match = FONACOT_FILE_RE.match(file_path.name)
        if not match:
            continue
        kind, year_str, quarter_str = match.groups()
        key = (int(year_str), int(quarter_str))
        pairs.setdefault(key, {})[kind.lower()] = file_path

    if not pairs:
        raise FileNotFoundError(
            f"No se encontraron archivos fonacot_(montos|trabajadores)_AAAAT#.csv en {raw_dir}"
        )

    total_raw_rows = 0
    used_files: list[str] = []
    frames: list[pd.DataFrame] = []

    for (anio, trimestre), files in sorted(pairs.items()):
        if "montos" not in files or "trabajadores" not in files:
            raise FileNotFoundError(
                f"Par incompleto para {anio}T{trimestre}: encontrados {list(files.keys())}"
            )

        df_montos_raw = extract_csv(files["montos"])
        df_trab_raw = extract_csv(files["trabajadores"])
        total_raw_rows += len(df_montos_raw) + len(df_trab_raw)
        used_files.extend([files["montos"].name, files["trabajadores"].name])

        montos_long = _melt_fonacot_wide(df_montos_raw, anio, "importe_ejercido_mxn")
        trab_long = _melt_fonacot_wide(df_trab_raw, anio, "numero_trabajadores")

        merged = pd.merge(
            trab_long,
            montos_long,
            on=["anio", "mes", "entidad_federativa", "genero"],
            how="outer",
        ).fillna(0)

        merged["numero_trabajadores"] = merged["numero_trabajadores"].round().astype(int)
        merged["numero_creditos"] = merged["numero_trabajadores"]
        merged["importe_ejercido_mxn"] = merged["importe_ejercido_mxn"].round(2)
        frames.append(merged)

    full_df = pd.concat(frames, ignore_index=True)
    full_df = (
        full_df.groupby(["anio", "mes", "entidad_federativa", "genero"], as_index=False)[
            ["numero_trabajadores", "numero_creditos", "importe_ejercido_mxn"]
        ]
        .sum()
    )

    # Total Nacional = suma de las 32 entidades + App Móvil (criterio oficial FONACOT)
    national_df = (
        full_df.groupby(["anio", "mes", "genero"], as_index=False)[
            ["numero_trabajadores", "numero_creditos", "importe_ejercido_mxn"]
        ]
        .sum()
    )
    national_df["entidad_federativa"] = "Nacional"
    national_df["importe_ejercido_mxn"] = national_df["importe_ejercido_mxn"].round(2)

    if keep_all_states:
        result = pd.concat([full_df, national_df], ignore_index=True) if keep_national else full_df
    else:
        oaxaca_df = full_df[full_df["entidad_federativa"] == "Oaxaca"].copy()
        result = pd.concat([oaxaca_df, national_df], ignore_index=True) if keep_national else oaxaca_df

    result["es_oaxaca"] = result["entidad_federativa"] == "Oaxaca"
    result["fecha_corte"] = pd.to_datetime(
        result["anio"].astype(str) + "-" + result["mes"].astype(str).str.zfill(2) + "-01"
    ).dt.date
    result["fuente"] = "datos.gob.mx - FONACOT 2025"
    result["importe_ejercido_mxn"] = result["importe_ejercido_mxn"].round(2)

    return result, total_raw_rows, used_files


def transform_long_csv(raw_df: pd.DataFrame, keep_national: bool = True) -> pd.DataFrame:
    """Transforma un CSV ya en formato largo (como data/raw/sample_oaxaca_creditos.csv)."""
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
    df["numero_trabajadores"] = _parse_numeric(df["numero_trabajadores"]).round().astype(int)
    df["numero_creditos"] = _parse_numeric(df["numero_creditos"]).round().astype(int)
    df["importe_ejercido_mxn"] = _parse_numeric(df["importe_ejercido_mxn"]).round(2)

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

    return (
        df.groupby(
            ["anio", "mes", "fecha_corte", "entidad_federativa", "es_oaxaca", "genero", "fuente"],
            as_index=False,
        )[["numero_trabajadores", "numero_creditos", "importe_ejercido_mxn"]]
        .sum()
    )


def _normalize_db_url(raw_url: str) -> str:
    """Asegura el uso explícito de psycopg2 con SQLAlchemy 2.0 y 2.1+."""
    if raw_url.startswith("postgresql://"):
        return raw_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return raw_url


def load_to_postgres(
    df: pd.DataFrame,
    source_name: str,
    total_raw: int,
    replace_existing: bool = True,
) -> int:
    """Carga los registros transformados a PostgreSQL con upsert idempotente."""
    database_url = _normalize_db_url(
        os.getenv(
            "DATABASE_URL",
            "postgresql://horizonte:horizonte_pass@localhost:5433/caja_ahorro_oaxaca",
        )
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
        if replace_existing:
            conn.execute(text("TRUNCATE TABLE creditos_entidad_genero RESTART IDENTITY;"))
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
                "archivo": source_name[:255],
                "leidos": total_raw,
                "oaxaca": oaxaca_count,
                "cargados": len(records),
                "estado": "EXITOSO",
                "mensaje": f"Carga completada para {len(records)} registros agregados ({oaxaca_count} de Oaxaca).",
            },
        )
    return len(records)


def main() -> None:
    parser = argparse.ArgumentParser(description="ETL Oaxaca - Créditos FONACOT por género y entidad")
    parser.add_argument(
        "--fonacot-dir",
        type=Path,
        default=Path("data/raw"),
        help="Directorio con los CSV oficiales fonacot_(montos|trabajadores)_AAAAT#.csv.",
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=None,
        help="Opcional: ruta a un CSV único en formato largo (ej. data/raw/sample_oaxaca_creditos.csv).",
    )
    parser.add_argument(
        "--only-oaxaca",
        action="store_true",
        help="Si se activa, omite los registros agregados de Nacional.",
    )
    parser.add_argument(
        "--all-states",
        action="store_true",
        help="Carga las 32 entidades + App Móvil además de Oaxaca y Nacional.",
    )
    parser.add_argument(
        "--append",
        action="store_true",
        help="Conserva registros previos en la tabla en lugar de reemplazarlos.",
    )
    args = parser.parse_args()

    if args.input is not None:
        raw_df = extract_csv(args.input)
        transformed_df = transform_long_csv(raw_df, keep_national=not args.only_oaxaca)
        source_label = str(args.input)
        total_raw = len(raw_df)
    else:
        transformed_df, total_raw, used_files = extract_and_transform_fonacot_dir(
            args.fonacot_dir,
            keep_national=not args.only_oaxaca,
            keep_all_states=args.all_states,
        )
        source_label = f"{args.fonacot_dir} ({len(used_files)} archivos FONACOT)"

    loaded = load_to_postgres(
        transformed_df,
        source_label,
        total_raw,
        replace_existing=not args.append,
    )

    oax = transformed_df[transformed_df["es_oaxaca"]]
    oax_cred = int(oax["numero_creditos"].sum())
    oax_monto = float(oax["importe_ejercido_mxn"].sum())
    print(f"ETL completado: {total_raw} filas leídas -> {loaded} registros cargados en PostgreSQL.")
    print(f"Resumen Oaxaca cargado: {oax_cred:,} créditos | ${oax_monto:,.2f} MXN")


if __name__ == "__main__":
    main()
