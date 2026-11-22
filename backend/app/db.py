"""Conexión a PostgreSQL mediante SQLAlchemy (driver explícito psycopg2)."""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

_raw_url = os.getenv(
    "DATABASE_URL",
    "postgresql://horizonte:horizonte_pass@localhost:5433/caja_ahorro_oaxaca",
)
if _raw_url.startswith("postgresql://"):
    DATABASE_URL = _raw_url.replace("postgresql://", "postgresql+psycopg2://", 1)
else:
    DATABASE_URL = _raw_url

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
