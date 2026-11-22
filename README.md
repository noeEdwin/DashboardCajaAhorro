# Horizonte Cooperativo — Dashboard Financiero (Enfoque Oaxaca)

Proyecto de la asignatura **Desarrollo de Software para la Toma de Decisiones** (Instituto Tecnológico de Oaxaca — TecNM).  
**Equipo:** Omadas | **Metodología:** Scrum adaptado (Sprint de 4 días)

---

## Arquitectura del Proyecto

| Carpeta / Archivo | Propósito | Sección del Documento PDF |
|---|---|---|
| `database/schema.sql` | Modelo relacional en **PostgreSQL 16** | 5.3 Selección de lenguaje y DBMS |
| `etl/extract_transform_load.py` | Proceso **ETL en Python** (limpieza y filtro Oaxaca) | 5.5.1 Proceso ETL (Python) |
| `backend/app/main.py` | API REST en **FastAPI** con cálculos de KPIs | 5.5 Implementación (Backend) |
| `frontend/src/App.jsx` | Dashboard en **React + Vite + Recharts** | 5.5 / 5.5.2 Visualización efectiva |
| `docker-compose.yml` | Contenedor PostgreSQL listo en 1 comando | 5.3 / 5.5 Entorno reproducible |

---

## KPIs Implementados (Sección 5.5.2)

1. **Total de Créditos Ejercidos (Oaxaca):** Conteo acumulado de créditos y trabajadores.
2. **Monto Total Financiado (MXN):** Importe total ejercido en Oaxaca.
3. **Ticket Promedio por Crédito:** `monto_total_mxn / total_creditos`.
4. **Participación por Género (%):** Distribución de créditos Mujeres vs. Hombres, con barra de participación.
5. **Brecha de Ticket por Género (MXN):** Diferencia de monto promedio entre hombres y mujeres.
6. **Crecimiento Periodo vs. Periodo (%):** Variación interanual en Oaxaca.
7. **Participación Oaxaca / Nacional (%):** Peso sobre el importe total nacional.
8. **Último Periodo Registrado:** Importe ejercido del último periodo registrado en Oaxaca (MXN) y su número de créditos.

---

## Equipo Omadas y Roles (Sprint de 4 Días)

- **Líder de Proyecto:** Sánchez Chávez Edwin Noé — Repositorio, Issues, coordinación y `docker-compose.yml`.
- **Analista:** Mendoza Jiménez Melody Nathalie — Diccionario de datos, fórmulas de KPIs y redacción 5.1 / 5.2.
- **Programador 1:** Sánchez Hernández Diego Alonso — Proceso ETL en Python (`etl/`) y carga a PostgreSQL.
- **Programador 2:** Castellanos Ríos Carlos Eduardo — API REST en FastAPI (`backend/`).
- **Diseñador:** Hernández Pérez Miguel Ángel — Interfaz, accesibilidad y gráficas en React (`frontend/`).
- **QA / Tester:** Méndez García Ángel de Jesús — Pruebas de integridad ETL vs. Dashboard y evidencias para el PDF.

---

## Cómo ejecutar el proyecto en local

### 1. Levantar PostgreSQL con Docker
```bash
cp .env.example .env
docker compose up -d
```

### 2. Ejecutar el proceso ETL (Python)
Descarga el CSV oficial de [datos.gob.mx (FONACOT)](https://www.datos.gob.mx/dataset/trabajadores_credito_ejercido_genero_entidad_federativa) en `data/raw/` o usa el archivo de ejemplo incluido:
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r etl/requirements.txt
python etl/extract_transform_load.py --input data/raw/sample_oaxaca_creditos.csv
```

### 3. Levantar el Backend (FastAPI)
```bash
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```
Documentación interactiva disponible en `http://localhost:8000/docs`.

### 4. Levantar el Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Abrir `http://localhost:5173`.
