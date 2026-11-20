-- Esquema de Base de Datos - Horizonte Cooperativo (Enfoque Oaxaca)
-- DBMS: PostgreSQL 16

CREATE TABLE IF NOT EXISTS creditos_entidad_genero (
    id SERIAL PRIMARY KEY,
    anio SMALLINT NOT NULL,
    mes SMALLINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    fecha_corte DATE NOT NULL,
    entidad_federativa VARCHAR(80) NOT NULL,
    es_oaxaca BOOLEAN NOT NULL DEFAULT FALSE,
    genero VARCHAR(20) NOT NULL,
    numero_trabajadores INTEGER NOT NULL DEFAULT 0 CHECK (numero_trabajadores >= 0),
    numero_creditos INTEGER NOT NULL DEFAULT 0 CHECK (numero_creditos >= 0),
    importe_ejercido_mxn NUMERIC(16, 2) NOT NULL DEFAULT 0 CHECK (importe_ejercido_mxn >= 0),
    fuente VARCHAR(120) NOT NULL DEFAULT 'datos.gob.mx - FONACOT',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_credito_periodo_entidad_genero UNIQUE (anio, mes, entidad_federativa, genero, fuente)
);

CREATE INDEX IF NOT EXISTS idx_creditos_oaxaca_periodo
    ON creditos_entidad_genero (es_oaxaca, anio, mes);

CREATE INDEX IF NOT EXISTS idx_creditos_genero
    ON creditos_entidad_genero (genero);

CREATE TABLE IF NOT EXISTS etl_ejecuciones (
    id SERIAL PRIMARY KEY,
    fecha_ejecucion TIMESTAMP NOT NULL DEFAULT NOW(),
    archivo_fuente VARCHAR(255) NOT NULL,
    registros_leidos INTEGER NOT NULL DEFAULT 0,
    registros_oaxaca INTEGER NOT NULL DEFAULT 0,
    registros_cargados INTEGER NOT NULL DEFAULT 0,
    estado VARCHAR(30) NOT NULL,
    mensaje TEXT
);
