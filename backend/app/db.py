"""Conexión a PostgreSQL mediante SQLAlchemy."""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://horizonte:horizonte_pass@localhost:5432/caja_ahorro_oaxaca",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
