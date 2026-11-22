"""Revisa un CSV de FONACOT (trabajadores o importes) antes de pasarlo al ETL.

Uso:
    python etl/revisar_csv.py data/raw/fonacot_montos_2025T1.csv
"""

import sys

import pandas as pd


def leer(ruta):
    for encoding in ("utf-8", "latin-1"):
        try:
            return pd.read_csv(ruta, encoding=encoding, dtype=str)
        except UnicodeDecodeError:
            continue
    raise ValueError(f"No se pudo leer {ruta}")


def a_numero(serie):
    return pd.to_numeric(serie.str.replace(r"[$,\s]", "", regex=True), errors="coerce")


def main(ruta):
    df = leer(ruta)
    print(f"Archivo: {ruta}")
    print(f"Filas: {len(df)}")
    print(f"Columnas ({len(df.columns)}): {list(df.columns)}\n")

    col_entidad = next((c for c in df.columns if c.strip().upper().replace(" ", "_") == "ENTIDAD_FEDERATIVA"), df.columns[0])
    entidades = df[col_entidad].astype(str).str.strip()
    print(f"Columna de entidad usada: {col_entidad}")
    print(f"Entidades ({entidades.nunique()}): {sorted(entidades.unique())}\n")

    cols_mes = [c for c in df.columns if c.lower().endswith(("_mujeres", "_hombres"))]
    print(f"Columnas de mes/genero: {cols_mes}")

    con_comas = [c for c in cols_mes if df[c].astype(str).str.contains(",").any()]
    print(f"Columnas con comas de miles: {con_comas or 'ninguna'}\n")

    oaxaca = df[entidades.str.upper().str.contains("OAXACA")]
    if oaxaca.empty:
        print("ATENCION: no aparece OAXACA en este archivo")
    else:
        print("Fila de OAXACA:")
        print(oaxaca[[col_entidad] + cols_mes].to_string(index=False))

    numeros = df[cols_mes].apply(a_numero)
    es_app = entidades.str.upper().str.contains("APP")
    print(f"\nTotal 32 entidades (sin APP MOVIL): {numeros[~es_app].sum().sum():,.0f}")
    print(f"Total APP MOVIL: {numeros[es_app].sum().sum():,.0f}")
    if not oaxaca.empty:
        print(f"Total OAXACA: {numeros.loc[oaxaca.index].sum().sum():,.0f}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1])
