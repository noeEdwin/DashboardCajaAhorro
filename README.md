<a id="readme-top"></a>

<div align="center">

<img src="docs/assets/banner.svg" alt="Horizonte Cooperativo: dashboard financiero del crédito FONACOT en Oaxaca, 2025" width="100%">

<br>

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<img src="docs/assets/ui/stats.svg" alt="Datos FONACOT 2025, 8 KPIs, conciliación 9/9, E2E 178/178, unitarias 5/5, entrega 27 de noviembre de 2026" height="34">

<br><br>

<a href="#instalacion-rapida"><img src="docs/assets/ui/nav-instalacion.svg" alt="Instalación rápida" height="44"></a>&nbsp;
<a href="#documentacion-tecnica"><img src="docs/assets/ui/nav-tecnica.svg" alt="Documentación técnica" height="44"></a>&nbsp;
<a href="#api-rest"><img src="docs/assets/ui/nav-api.svg" alt="API REST" height="44"></a>&nbsp;
<a href="https://github.com/users/noeEdwin/projects/6"><img src="docs/assets/ui/nav-tablero.svg" alt="Tablero del sprint" height="44"></a>

<br><br>

<img src="docs/assets/capturas/mockup.png" alt="Dashboard Horizonte Cooperativo en escritorio y en móvil con los datos oficiales de FONACOT 2025" width="100%">

</div>

---

<details>
<summary><strong>Tabla de contenidos</strong></summary>

1. [Acerca del proyecto](#acerca-del-proyecto)
2. [Características](#caracteristicas)
3. [Arquitectura](#arquitectura)
4. [Stack y dependencias](#stack-y-dependencias)
5. [Instalación rápida](#instalacion-rapida)
6. [Instalación detallada](#instalacion-detallada)
7. [Documentación técnica](#documentacion-tecnica)
   - [Proceso ETL](#proceso-etl)
   - [Base de datos](#base-de-datos)
   - [Backend](#backend)
   - [Frontend](#frontend)
   - [Decisiones técnicas](#decisiones-tecnicas)
   - [Seguridad](#seguridad)
8. [KPIs](#kpis)
9. [API REST](#api-rest)
10. [Validación y pruebas](#validacion-y-pruebas)
11. [Capturas](#capturas)
12. [Estructura del repositorio](#estructura-del-repositorio)
13. [Alcance y limitaciones](#alcance-y-limitaciones)
14. [Equipo](#equipo)
15. [Cómo contribuir](#como-contribuir)
16. [Referencias](#referencias)

</details>

---

<a id="acerca-del-proyecto"></a>

<img src="docs/assets/ui/h-acerca-del-proyecto.svg" alt="Acerca del proyecto" width="100%">

Una caja de ahorro y préstamo en Oaxaca necesita saber cómo se mueve el crédito al consumo en el estado. El Instituto FONACOT publica esa información como datos abiertos, pero repartida en **8 CSV** (créditos e importes por trimestre), con una columna por mes y género, sin año ni total nacional, y con nombres de estados que cambian entre archivos.

**Horizonte Cooperativo** resuelve eso con un flujo completo: un ETL en Python une y limpia los archivos, PostgreSQL los guarda, una API en FastAPI calcula los indicadores y un dashboard en React los muestra con filtros.

<table>
  <tr>
    <th width="50%">Antes</th>
    <th width="50%">Con Horizonte Cooperativo</th>
  </tr>
  <tr>
    <td>Abrir 8 CSV, unirlos a mano y corregir los nombres de los estados</td>
    <td>Un comando de ETL deja los datos limpios en PostgreSQL</td>
  </tr>
  <tr>
    <td>Calcular totales, promedios y porcentajes en una hoja de cálculo</td>
    <td>8 KPIs calculados por la API y verificados contra los archivos originales</td>
  </tr>
  <tr>
    <td>Sin total nacional para comparar</td>
    <td>Participación de Oaxaca en el país, total y por género</td>
  </tr>
  <tr>
    <td>Repetir todo para ver solo mujeres u hombres</td>
    <td>Filtros por año y género que actualizan toda la pantalla</td>
  </tr>
</table>

> <img src="docs/assets/ui/nota.svg" alt="Nota" height="30">
>
> **Pregunta de negocio:** ¿cómo se comportó en 2025 el crédito FONACOT en Oaxaca por trimestre y por género, y qué peso tiene el estado dentro del total nacional?

| | |
|---|---|
| **Materia** | Software para la Toma de Decisiones (DAD-2605) |
| **Institución** | Tecnológico Nacional de México — Instituto Tecnológico de Oaxaca |
| **Carrera / grupo** | Ingeniería en Sistemas Computacionales — 7SB |
| **Equipo** | Omadas |
| **Metodología** | Scrum adaptado, sprint de 4 días |
| **Docente** | Hernández Luis Moisés Adrián |

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

<a id="caracteristicas"></a>

<img src="docs/assets/ui/h-caracteristicas.svg" alt="Características" width="100%">

<table>
  <tr>
    <td width="33%" valign="top"><b>8 KPIs financieros</b><br><sub>Calculados con datos oficiales de Oaxaca; la materia pide al menos 7.</sub></td>
    <td width="33%" valign="top"><b>Filtros por año y género</b><br><sub>Actualizan al mismo tiempo tarjetas, gráficas y tabla.</sub></td>
    <td width="33%" valign="top"><b>3 gráficas</b><br><sub>Tendencia mensual, monto por género y ticket promedio por género.</sub></td>
  </tr>
  <tr>
    <td width="33%" valign="top"><b>Tabla operativa</b><br><sub>Cifras exactas para cotejar lo que muestran las gráficas.</sub></td>
    <td width="33%" valign="top"><b>Accesibilidad</b><br><sub>Teclado, foco visible, ARIA, tabla alternativa en cada gráfica y <code>prefers-reduced-motion</code>.</sub></td>
    <td width="33%" valign="top"><b>Diseño responsivo</b><br><sub>Escritorio, tablet y móvil sin desbordamiento de página.</sub></td>
  </tr>
  <tr>
    <td width="33%" valign="top"><b>Manejo de estados</b><br><sub>Carga, error con reintento, estado vacío y modo demostración identificado.</sub></td>
    <td width="33%" valign="top"><b>ETL idempotente</b><br><sub>Correrlo dos veces no duplica datos; cada corrida queda en <code>etl_ejecuciones</code>.</sub></td>
    <td width="33%" valign="top"><b>API documentada</b><br><sub>Swagger automático en <code>/docs</code> y esquema OpenAPI.</sub></td>
  </tr>
</table>

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

<a id="arquitectura"></a>

<img src="docs/assets/ui/h-arquitectura.svg" alt="Arquitectura" width="100%">

Arquitectura desacoplada en tres capas: datos (ETL + PostgreSQL), servicios (API REST) y presentación (SPA en React).

<img src="docs/assets/pipeline.svg" alt="Flujo de datos: 8 CSV oficiales, ETL en Python, PostgreSQL 16, API FastAPI y dashboard en React" width="100%">

<details>
<summary><strong>Ver diagramas de flujo y de secuencia</strong></summary>

```mermaid
flowchart LR
    A[("8 CSV oficiales<br/>FONACOT 2025<br/>data/raw")] -->|Extract| B["ETL Python<br/>pandas + SQLAlchemy"]
    B -->|Transform + Load| C[("PostgreSQL 16<br/>Docker, puerto 5433")]
    C -->|SQL parametrizado| D["API FastAPI<br/>Uvicorn, puerto 8000"]
    D -->|JSON| E["Dashboard React<br/>Vite + Recharts, puerto 5173"]
    E -->|"GET ?anio=&genero="| D
```

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as React (App.jsx)
    participant A as FastAPI
    participant P as PostgreSQL
    U->>F: Cambia filtro Año / Género
    F->>F: Cancela la petición anterior (AbortController)
    par Peticiones en paralelo
        F->>A: GET /api/kpis
        F->>A: GET /api/genero
        F->>A: GET /api/tendencia
    end
    A->>P: SELECT ... WHERE es_oaxaca AND filtros
    P-->>A: Filas agregadas
    A-->>F: JSON
    F-->>U: Actualiza tarjetas, gráficas y tabla
```

</details>

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

<a id="stack-y-dependencias"></a>

<img src="docs/assets/ui/h-stack-y-dependencias.svg" alt="Stack y dependencias" width="100%">

| Capa | Tecnología | Versión | Dependencias principales |
|---|---|---|---|
| ETL | Python | 3.9+ | `pandas>=2.2.0`, `sqlalchemy>=2.0.0`, `psycopg2-binary>=2.9.9`, `python-dotenv>=1.0.1` |
| Base de datos | PostgreSQL | 16 (imagen `postgres:16-alpine`) | Docker Compose |
| Backend | FastAPI + Uvicorn | `fastapi>=0.115.0`, `uvicorn[standard]>=0.30.0` | `sqlalchemy>=2.0.0`, `psycopg2-binary`, `python-dotenv` |
| Frontend | React + Vite | `react ^18.3.1`, `vite ^5.4.8` | `recharts ^2.12.7`, `@vitejs/plugin-react ^4.3.2` |
| Pruebas | Node.js test runner | Node 18+ | `node:test`, `node:assert` (sin dependencias extra) |

| Puerto | Servicio |
|:-:|---|
| `5433` | PostgreSQL (mapeado al 5432 del contenedor) |
| `8000` | API FastAPI |
| `5173` | Servidor de desarrollo de Vite |

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

<a id="instalacion-rapida"></a>

<img src="docs/assets/ui/h-instalacion-rapida.svg" alt="Instalación rápida" width="100%">

> <img src="docs/assets/ui/importante.svg" alt="Importante" height="30">
>
> Necesitas **Docker Desktop**, **Python 3.9+**, **Node.js 18+** y **Git**. Ejecuta los comandos desde la raíz del repositorio.

```bash
# 1. Clonar y configurar
git clone https://github.com/noeEdwin/DashboardCajaAhorro.git
cd DashboardCajaAhorro
cp .env.example .env                 # PowerShell: Copy-Item .env.example .env

# 2. Base de datos
docker compose up -d

# 3. ETL (carga los 8 CSV oficiales)
python -m venv .venv
source .venv/bin/activate            # PowerShell: .venv\Scripts\Activate.ps1
pip install -r etl/requirements.txt -r backend/requirements.txt
python etl/extract_transform_load.py --fonacot-dir data/raw

# 4. API (deja esta terminal abierta)
uvicorn backend.app.main:app --reload --port 8000

# 5. Dashboard (en otra terminal)
cd frontend && npm install && npm run dev
```

Abre **http://localhost:5173** para el dashboard y **http://localhost:8000/docs** para la API.

Salida esperada del ETL:

```
ETL completado: 264 filas leídas -> 48 registros cargados en PostgreSQL.
Resumen Oaxaca cargado: 24,048 créditos | $675,334,814.51 MXN
```

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

<a id="instalacion-detallada"></a>

<img src="docs/assets/ui/h-instalacion-detallada.svg" alt="Instalación detallada" width="100%">

<details>
<summary><strong>1. Variables de entorno</strong></summary>

Copia `.env.example` a `.env`. Los valores de ejemplo funcionan en local:

| Variable | Valor por defecto | Uso |
|---|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | `horizonte` / `horizonte_pass` | Usuario de la base en Docker |
| `POSTGRES_DB` | `caja_ahorro_oaxaca` | Nombre de la base |
| `POSTGRES_PORT` | `5433` | Puerto en tu equipo (evita chocar con un PostgreSQL local en 5432) |
| `DATABASE_URL` | `postgresql://horizonte:horizonte_pass@localhost:5433/caja_ahorro_oaxaca` | Conexión del ETL y del backend |
| `VITE_API_URL` | `http://localhost:8000` | Dirección de la API para el frontend |

El ETL y el backend leen `.env` con `python-dotenv`. Si `DATABASE_URL` no existe, usan el valor por defecto de la tabla.

> <img src="docs/assets/ui/advertencia.svg" alt="Advertencia" height="30">
>
> El archivo `.env` está en `.gitignore`. No lo subas al repositorio.

</details>

<details>
<summary><strong>2. Base de datos (PostgreSQL en Docker)</strong></summary>

```bash
docker compose up -d
docker compose ps        # el contenedor horizonte_postgres debe aparecer como "healthy"
```

- La primera vez se ejecuta `database/schema.sql` desde `/docker-entrypoint-initdb.d/` y se crean las tablas.
- Los datos persisten en el volumen `postgres_data`.
- El contenedor tiene un `healthcheck` con `pg_isready` cada 5 s.
- Para reiniciar la base desde cero: `docker compose down -v` y luego `docker compose up -d`.

</details>

<details>
<summary><strong>3. Entorno de Python y ETL</strong></summary>

Crear y activar el entorno virtual:

| Sistema | Activar |
|---|---|
| Linux / macOS | `source .venv/bin/activate` |
| Windows (PowerShell) | `.venv\Scripts\Activate.ps1` |
| Windows (Git Bash) | `source .venv/Scripts/activate` |

```bash
pip install -r etl/requirements.txt
python etl/extract_transform_load.py --fonacot-dir data/raw
```

Opciones del ETL:

| Opción | Efecto |
|---|---|
| `--fonacot-dir data/raw` | Carpeta con los 8 CSV oficiales (valor por defecto) |
| `--input data/raw/sample_oaxaca_creditos.csv` | Carga un CSV de ejemplo en formato largo |
| `--only-oaxaca` | Omite los registros Nacional |
| `--all-states` | Carga también las 32 entidades y App Móvil |
| `--append` | Conserva los registros previos en lugar de vaciar la tabla |

Para revisar rápido un CSV: `python etl/revisar_csv.py data/raw/fonacot_montos_2025T1.csv`

</details>

<details>
<summary><strong>4. Backend (FastAPI)</strong></summary>

```bash
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

Comprueba que responde en `http://localhost:8000/health`. Debe devolver `{"status": "ok", "database": "connected"}`.

</details>

<details>
<summary><strong>5. Frontend (React + Vite)</strong></summary>

```bash
cd frontend
npm install
npm run dev          # desarrollo en http://localhost:5173
npm run build        # compilación de producción en frontend/dist/
npm run preview      # vista previa de la compilación
```

</details>

<details>
<summary><strong>Solución de problemas</strong></summary>

| Síntoma | Qué revisar |
|---|---|
| El backend no conecta a la base | Que el contenedor esté activo (`docker compose ps`) y que `DATABASE_URL` use el puerto **5433** |
| `/health` devuelve error 500 | La base no está disponible; revisa el contenedor |
| El dashboard muestra un error de conexión | Que la API esté corriendo en el puerto 8000 y que `VITE_API_URL` apunte a ella |
| El dashboard aparece vacío | Que el ETL se haya ejecutado (paso 3) |
| Cambios en `schema.sql` no se aplican | El script solo corre al crear el volumen: `docker compose down -v` y volver a levantar |
| PowerShell no deja activar el entorno | Ejecutar una vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| El puerto 5433 está ocupado | Cambiar `POSTGRES_PORT` y `DATABASE_URL` en `.env` |

</details>

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

<a id="documentacion-tecnica"></a>

<img src="docs/assets/ui/h-documentacion-tecnica.svg" alt="Documentación técnica" width="100%">

<a id="proceso-etl"></a>

<img src="docs/assets/ui/h3-proceso-etl.svg" alt="Proceso ETL" width="100%">

Archivo: [`etl/extract_transform_load.py`](etl/extract_transform_load.py)

```mermaid
flowchart TD
    A["Buscar archivos con regex<br/>fonacot_(montos|trabajadores)_AAAATn.csv"] --> B["Agrupar en pares por año y trimestre<br/>(falla si falta uno del par)"]
    B --> C["Leer CSV como texto<br/>utf-8-sig → utf-8 → latin-1"]
    C --> D["Normalizar entidades<br/>quitar acentos, minúsculas, diccionario canónico"]
    D --> E["melt: formato ancho → largo<br/>ene_mujeres → mes=1, genero=Mujer"]
    E --> F["Limpiar números<br/>quitar $, comas y espacios"]
    F --> G["Unir trabajadores + montos<br/>outer merge por anio, mes, entidad, genero"]
    G --> H["Calcular fila Nacional<br/>Σ 32 entidades + App Móvil"]
    H --> I["Filtrar Oaxaca + Nacional<br/>agregar es_oaxaca, fecha_corte, fuente"]
    I --> J["Carga en una transacción<br/>TRUNCATE + INSERT ... ON CONFLICT DO UPDATE"]
    J --> K["Registrar corrida en etl_ejecuciones"]
```

**Extract**

- Detecta los archivos con la expresión `^fonacot_(montos|trabajadores)_(\d{4})T([1-4])\.csv$` y forma un par por año y trimestre. Si un trimestre no tiene sus dos archivos, el proceso se detiene.
- Lee cada CSV con `dtype=str` para no perder formato y prueba las codificaciones `utf-8-sig`, `utf-8` y `latin-1`.

**Transform**

| Problema en el CSV de origen | Solución en el ETL |
|---|---|
| Una columna por mes y género (`ene_mujeres`, `ene_hombres`, …) | `pandas.melt` a formato largo; `MONTH_MAP` convierte `ene`…`dic` en 1…12 |
| No trae el año | Se toma del nombre del archivo (`2025T1` → 2025) |
| Nombres de estados distintos entre trimestres (`México` / `Estado de México`, `Coahuila de Zaragoza` / `Coahuila`) | `normalize_state`: quita acentos con `unicodedata`, pasa a minúsculas y usa un diccionario canónico |
| Etiquetas de género variadas | `normalize_gender`: `Mujer`, `Hombre` o `No especificado` |
| Números con `$`, comas o espacios | `_parse_numeric` los limpia y convierte vacíos en 0 |
| Créditos e importes en archivos separados | `pd.merge(..., how="outer")` por `anio, mes, entidad_federativa, genero` |
| No hay total nacional | Se suma por `anio, mes, genero` sobre todas las entidades, incluida App Móvil |

El archivo de "trabajadores" se usa como número de créditos (`numero_creditos = numero_trabajadores`), porque el diccionario de FONACOT lo define como créditos otorgados.

**Load**

- Todo ocurre dentro de una sola transacción (`engine.begin()`): si algo falla, no queda una carga a medias.
- Por defecto vacía la tabla con `TRUNCATE ... RESTART IDENTITY`; con `--append` conserva lo que había.
- Inserta en lote con `INSERT ... ON CONFLICT (anio, mes, entidad_federativa, genero, fuente) DO UPDATE`, así que correr el ETL dos veces no duplica registros.
- Registra la corrida en `etl_ejecuciones`. Con los datos de 2025: **264** filas leídas (8 archivos × 33 filas), **24** registros de Oaxaca (12 meses × 2 géneros) y **48** registros cargados (Oaxaca + Nacional).

<a id="base-de-datos"></a>

<img src="docs/assets/ui/h3-base-de-datos.svg" alt="Base de datos" width="100%">

Archivo: [`database/schema.sql`](database/schema.sql)

```mermaid
erDiagram
    creditos_entidad_genero {
        SERIAL id PK
        SMALLINT anio
        SMALLINT mes "CHECK 1 a 12"
        DATE fecha_corte "primer día del mes"
        VARCHAR entidad_federativa "Oaxaca o Nacional"
        BOOLEAN es_oaxaca
        VARCHAR genero "Mujer u Hombre"
        INTEGER numero_trabajadores "CHECK >= 0"
        INTEGER numero_creditos "CHECK >= 0"
        NUMERIC importe_ejercido_mxn "16,2 CHECK >= 0"
        VARCHAR fuente
        TIMESTAMP created_at
    }
    etl_ejecuciones {
        SERIAL id PK
        TIMESTAMP fecha_ejecucion
        VARCHAR archivo_fuente
        INTEGER registros_leidos
        INTEGER registros_oaxaca
        INTEGER registros_cargados
        VARCHAR estado
        TEXT mensaje
    }
```

| Elemento | Definición | Para qué sirve |
|---|---|---|
| Restricción única `uq_credito_periodo_entidad_genero` | `(anio, mes, entidad_federativa, genero, fuente)` | Evita duplicados y permite el upsert del ETL |
| Índice `idx_creditos_oaxaca_periodo` | `(es_oaxaca, anio, mes)` | Acelera las consultas de la API, que siempre filtran Oaxaca por periodo |
| Índice `idx_creditos_genero` | `(genero)` | Acelera los filtros y agrupaciones por género |
| Tipo `NUMERIC(16,2)` | Importes en pesos | Precisión exacta, sin errores de punto flotante |
| Restricciones `CHECK` | Mes entre 1 y 12, conteos e importes ≥ 0 | La base rechaza datos imposibles |

<a id="backend"></a>

<img src="docs/assets/ui/h3-backend.svg" alt="Backend" width="100%">

Archivos: [`backend/app/main.py`](backend/app/main.py) y [`backend/app/db.py`](backend/app/db.py)

- **Conexión** (`db.py`): lee `DATABASE_URL`, la convierte a `postgresql+psycopg2://` para que SQLAlchemy 2 use el driver correcto y crea el motor con `pool_pre_ping=True` para descartar conexiones caídas.
- **Filtros** (`_build_filters`): arma la cláusula `WHERE` solo con condiciones fijas y pasa los valores del usuario como parámetros enlazados (`:anio`, `:genero`). El género se compara sin distinguir mayúsculas y el valor `Todos` se ignora.
- **Cálculo de KPIs** (`/api/kpis`): ejecuta cinco consultas agregadas en una sola conexión: totales, totales por género, monto por año, monto por trimestre (`CEIL(mes / 3.0)`) y monto nacional con los mismos filtros.
- **Reglas**:
  - El crecimiento compara años si hay dos o más en la selección; si no, compara los dos últimos trimestres.
  - La brecha de ticket devuelve `null` si la selección no tiene créditos de ambos géneros.
  - Las divisiones entre cero devuelven `0.0` en lugar de error.
- **CORS** abierto (`allow_origins=["*"]`) para que el frontend en el puerto 5173 pueda consultar la API en el 8000.
- Metadatos de OpenAPI: título *Horizonte Cooperativo API - Oaxaca*, versión `1.1.0`.

<a id="frontend"></a>

<img src="docs/assets/ui/h3-frontend.svg" alt="Frontend" width="100%">

Carpeta: [`frontend/src/`](frontend/src/)

| Archivo | Responsabilidad |
|---|---|
| `App.jsx` | Estado global (filtros, datos, carga, error, modo demostración), llamadas a la API y armado de la página |
| `components/Sidebar.jsx` | Navegación lateral; en móvil se colapsa con `aria-expanded` y `aria-controls` |
| `components/FilterBar.jsx` | Selectores de Año y Género con etiquetas, botón Limpiar filtros y región `aria-live` |
| `components/KpiCard.jsx` | Tarjeta reutilizable para los 8 KPIs, con barras `role="progressbar"` y números tabulares |
| `components/ChartsSection.jsx` | Las 3 gráficas de Recharts y la tabla operativa por género |
| `components/ChartDataTable.jsx` | Tabla HTML desplegable con los mismos datos de cada gráfica |
| `components/StateFeedback.jsx` | Esqueleto de carga, alerta de error con reintento y estado vacío |
| `data/sampleDemoData.js` | Datos de ejemplo para el modo demostración |
| `utils/formatters.js` | Formato de moneda, números y porcentajes en `es-MX` |
| `utils/metrics.js` | Cálculo de barras, géneros presentes y último periodo (KPI 8) |
| `utils/useReducedMotion.js` | Detecta `prefers-reduced-motion` para desactivar animaciones |

Flujo de datos en `App.jsx`:

1. Al cargar, consulta `/api/filtros` para llenar los selectores.
2. Cada vez que cambia un filtro, cancela la petición anterior con `AbortController` y lanza en paralelo (`Promise.all`) `/api/kpis`, `/api/genero` y `/api/tendencia`.
3. Si la API falla, borra las métricas anteriores para no mostrar datos viejos, enseña la alerta y permite reintentar o entrar al modo demostración.
4. El KPI 8 se calcula en el cliente con el último mes de `/api/tendencia`.

La URL de la API se toma de `VITE_API_URL` y, si no existe, usa `http://localhost:8000`.

<a id="decisiones-tecnicas"></a>

<img src="docs/assets/ui/h3-decisiones-tecnicas.svg" alt="Decisiones técnicas" width="100%">

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| PostgreSQL en Docker | Instalación local de cada integrante | Mismo entorno para los 6 integrantes con un solo comando |
| Puerto 5433 | Puerto 5432 por defecto | Evitar choques con PostgreSQL instalados localmente |
| Guardar solo Oaxaca + Nacional | Guardar las 33 filas por mes | El dashboard solo necesita esas dos; `--all-states` queda disponible |
| Calcular el total nacional en el ETL | Calcularlo en cada consulta de la API | Consultas más simples y rápidas; el cálculo se hace una vez |
| KPIs calculados en la API con SQL | Calcularlos en el frontend | Una sola fuente de verdad, verificable con consultas directas |
| Crecimiento trimestral | Crecimiento anual | Solo hay datos de 2025 |
| `NUMERIC(16,2)` para importes | `FLOAT` | Precisión exacta en dinero |

<a id="seguridad"></a>

<img src="docs/assets/ui/h3-seguridad.svg" alt="Seguridad" width="100%">

- Las consultas usan **parámetros enlazados** de SQLAlchemy; los valores del usuario nunca se concatenan al SQL.
- Las credenciales viven en `.env`, que está fuera del control de versiones.
- La API es **solo lectura** (todos los endpoints son `GET`) y trabaja con datos públicos agregados, sin información personal.
- **Antes de publicarla fuera de un entorno local** conviene restringir CORS al dominio del frontend en lugar de `"*"` y cambiar las credenciales de ejemplo de PostgreSQL.

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

<a id="kpis"></a>

<img src="docs/assets/ui/h-kpis.svg" alt="KPIs" width="100%">

Todos se calculan sobre Oaxaca y respetan los filtros de **Año** y **Género**. Valores de 2025 sin filtros:

<img src="docs/assets/kpis.svg" alt="Las ocho tarjetas KPI con los valores de Oaxaca 2025" width="100%">

<br>

<img src="docs/assets/trimestres.svg" alt="Monto ejercido en Oaxaca por trimestre de 2025: 170.4, 168.9, 177.9 y 158.2 millones de pesos" width="100%">

| # | KPI | Fórmula | Valor Oaxaca 2025 |
|:-:|---|---|--:|
| 1 | Créditos ejercidos | Σ créditos mujeres + Σ créditos hombres | **24,048** |
| 2 | Monto total financiado | Σ importe mujeres + Σ importe hombres | **$675,334,814.51** |
| 3 | Ticket promedio por crédito | KPI 2 ÷ KPI 1 | **$28,082.79** |
| 4 | Participación por género | créditos del género ÷ KPI 1 × 100 | **41.58 %** M · **58.42 %** H |
| 5 | Brecha de ticket por género | ticket hombres − ticket mujeres | **$1,129.93** |
| 6 | Crecimiento trimestral del monto | (trim. actual − anterior) ÷ anterior × 100 | **−11.09 %** (4T vs 3T) |
| 7 | Participación en el total nacional | monto Oaxaca ÷ monto nacional × 100 | **1.01 %** |
| 8 | Último periodo registrado | importe y créditos del último mes | **$42,129,664** · dic 2025 · 1,518 créditos |


<details>
<summary><strong>Desglose por trimestre (base de los KPIs 6 y 7)</strong></summary>

| Trimestre | Créditos Oaxaca | Monto Oaxaca (MXN) | Monto nacional (MXN) | Participación |
|:-:|--:|--:|--:|--:|
| 1T 2025 | 5,960 | 170,391,932 | 15,525,525,837 | 1.10 % |
| 2T 2025 | 5,821 | 168,895,466 | 15,838,163,286 | 1.07 % |
| 3T 2025 | 6,550 | 177,890,858 | 18,517,548,813 | 0.96 % |
| 4T 2025 | 5,717 | 158,156,558 | 16,889,088,475 | 0.94 % |

</details>

> <img src="docs/assets/ui/consejo.svg" alt="Consejo" height="30">
>
> **Reglas de cálculo**
> - El KPI 1 cuenta **créditos**, no personas únicas, como lo define el diccionario de datos de FONACOT.
> - El KPI 5 devuelve `null` y se muestra como **N/A** cuando se filtra un solo género.
> - El KPI 6 compara trimestres porque solo hay datos de 2025; con varios años cambia a comparación anual.
> - En el KPI 7, al filtrar por género, el total nacional (32 entidades + App Móvil) usa el mismo filtro.

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

<a id="api-rest"></a>

<img src="docs/assets/ui/h-api-rest.svg" alt="API REST" width="100%">

Base: `http://localhost:8000` · Swagger: `http://localhost:8000/docs` · Esquema OpenAPI: `http://localhost:8000/openapi.json`

| Método | Ruta | Parámetros (opcionales) | Devuelve |
|:-:|---|---|---|
| `GET` | `/health` | — | Estado de la conexión con PostgreSQL |
| `GET` | `/api/filtros` | — | `anios` y `generos` disponibles para Oaxaca |
| `GET` | `/api/kpis` | `anio` (entero), `genero` (`Mujer`, `Hombre`, `Todos`) | KPIs 1 a 7 de Oaxaca |
| `GET` | `/api/genero` | `anio` | Trabajadores, créditos, monto y ticket por género |
| `GET` | `/api/tendencia` | `anio`, `genero` | Serie mensual (`periodo` en formato `YYYY-MM`), base del KPI 8 |
| `GET` | `/api/comparativa-nacional` | `anio`, `genero` | Créditos, monto y ticket de Oaxaca frente al nacional |

<details>
<summary><strong>Ejemplo: <code>GET /api/kpis</code> sin filtros</strong></summary>

```json
{
  "kpis": {
    "total_trabajadores": 24048,
    "total_creditos": 24048,
    "monto_total_mxn": 675334814.51,
    "ticket_promedio_mxn": 28082.79,
    "participacion_mujeres_pct": 41.58,
    "participacion_hombres_pct": 58.42,
    "brecha_ticket_genero_mxn": 1129.93,
    "crecimiento_periodo_pct": -11.09,
    "crecimiento_detalle": "Trimestral: 4T 2025 vs. 3T 2025",
    "participacion_oaxaca_nacional_pct": 1.01
  }
}
```

Con `?genero=Mujer`, `brecha_ticket_genero_mxn` es `null`.

</details>

<details>
<summary><strong>Formato de las demás respuestas</strong></summary>

```text
GET /health                   -> {"status": "ok", "database": "connected"}
GET /api/filtros              -> {"anios": [...], "generos": [...]}
GET /api/genero               -> {"data": [{"genero", "trabajadores", "creditos", "monto_mxn", "ticket_promedio_mxn"}, ...]}
GET /api/tendencia            -> {"data": [{"anio", "mes", "periodo", "genero", "creditos", "monto_mxn"}, ...]}
GET /api/comparativa-nacional -> {"oaxaca": {"creditos", "monto_mxn", "ticket_promedio_mxn"},
                                  "nacional": {"creditos", "monto_mxn", "ticket_promedio_mxn"}, ...}
```

</details>

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

<a id="validacion-y-pruebas"></a>

<img src="docs/assets/ui/h-validacion-y-pruebas.svg" alt="Validación y pruebas" width="100%">

Cada cifra se rastreó por toda la cadena:

```mermaid
flowchart LR
    A[CSV oficial] --> B[Consulta SQL] --> C[Respuesta de la API] --> D[Valor en pantalla]
```

| Verificación | Resultado |
|---|:-:|
| Conciliación CSV ↔ SQL ↔ API (9 combinaciones de año y género, incluidas selecciones vacías) | 9/9 |
| Recálculo independiente de los 8 KPIs desde los CSV (QA) | 8/8 |
| Pruebas unitarias del frontend | 5/5 |
| Comprobaciones E2E en navegador (aserciones) | 178/178 |
| Compilación de producción (`npm run build`) | Aprobada |
| Diseño responsivo (1920×1080, 768×1024, 390×844) | Aprobado |
| Falla simulada de la API (alerta, reintento, sin datos obsoletos) | Aprobada |

Pruebas unitarias (`frontend/src/utils/dashboard.test.mjs`):

| Prueba | Qué comprueba |
|---|---|
| `formatMXN` | Formato de moneda `es-MX` sin `NaN` y valores vacíos |
| `formatNum` / `formatPct` | Formato de números y porcentajes |
| `getSampleDashboardData` | Cálculo de los KPIs de demostración con filtros de año y género |
| Barra nacional | La barra representa exactamente el porcentaje indicado |
| `trendGenders` / `lastPeriodSummary` | Soporte de otros géneros y cálculo del último periodo con filtro |

```bash
cd frontend
node --test src/utils/dashboard.test.mjs
```

<details>
<summary><strong>Consultas SQL para verificar los KPIs manualmente</strong></summary>

Conectarse a la base:

```bash
docker exec -it horizonte_postgres psql -U horizonte -d caja_ahorro_oaxaca
```

```sql
-- KPIs 1, 2 y 3: créditos, monto y ticket promedio de Oaxaca
SELECT SUM(numero_creditos) AS creditos,
       SUM(importe_ejercido_mxn) AS monto,
       ROUND(SUM(importe_ejercido_mxn) / SUM(numero_creditos), 2) AS ticket
FROM creditos_entidad_genero
WHERE es_oaxaca;

-- KPIs 4 y 5: participación y ticket por género
SELECT genero,
       SUM(numero_creditos) AS creditos,
       ROUND(100.0 * SUM(numero_creditos) / SUM(SUM(numero_creditos)) OVER (), 2) AS pct,
       ROUND(SUM(importe_ejercido_mxn) / SUM(numero_creditos), 2) AS ticket
FROM creditos_entidad_genero
WHERE es_oaxaca
GROUP BY genero;

-- KPI 6: monto por trimestre
SELECT CEIL(mes / 3.0) AS trimestre, SUM(importe_ejercido_mxn) AS monto
FROM creditos_entidad_genero
WHERE es_oaxaca
GROUP BY 1 ORDER BY 1;

-- KPI 7: participación de Oaxaca en el nacional
SELECT ROUND(100.0 *
       SUM(importe_ejercido_mxn) FILTER (WHERE es_oaxaca) /
       SUM(importe_ejercido_mxn) FILTER (WHERE entidad_federativa = 'Nacional'), 2) AS pct
FROM creditos_entidad_genero;

-- KPI 8: último mes registrado
SELECT fecha_corte, SUM(numero_creditos) AS creditos, SUM(importe_ejercido_mxn) AS monto
FROM creditos_entidad_genero
WHERE es_oaxaca
GROUP BY fecha_corte ORDER BY fecha_corte DESC LIMIT 1;

-- Bitácora del ETL
SELECT * FROM etl_ejecuciones ORDER BY fecha_ejecucion DESC LIMIT 1;
```

</details>

El detalle de la validación está en [`docs/aportacion-miguel-dashboard.md`](docs/aportacion-miguel-dashboard.md) y en el PR #11.

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

<a id="capturas"></a>

<img src="docs/assets/ui/h-capturas.svg" alt="Capturas" width="100%">

Capturas reales del sistema con los datos oficiales de FONACOT 2025. Los originales sin marco están en [`docs/evidencias/`](docs/evidencias/).

<table>
  <tr>
    <td width="50%" valign="top">
      <img src="docs/assets/capturas/graficas-y-tabla.png" alt="Gráficas y tabla operativa" width="100%">
      <p><b>Gráficas y tabla operativa</b><br><sub>Tendencia mensual, monto y ticket por género, con la tabla de detalle para cotejar cifras.</sub></p>
    </td>
    <td width="50%" valign="top">
      <img src="docs/assets/capturas/filtro-2025-mujer.png" alt="Filtro Año = 2025 y Género = Mujer" width="100%">
      <p><b>Filtro Año = 2025 y Género = Mujer</b><br><sub>Las tarjetas se recalculan y la brecha de ticket aparece como N/A, porque requiere ambos géneros.</sub></p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <img src="docs/assets/capturas/tabla-accesible.png" alt="Tabla alternativa accesible" width="100%">
      <p><b>Tabla alternativa accesible</b><br><sub>Cada gráfica incluye una tabla desplegable con los mismos datos para lectores de pantalla.</sub></p>
    </td>
    <td width="50%" valign="top">
      <img src="docs/assets/capturas/estado-error-api.png" alt="Estado de error con reintento" width="100%">
      <p><b>Estado de error con reintento</b><br><sub>Si la API no responde, se borran los datos anteriores y se ofrece reintentar o ver el modo demostración.</sub></p>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td width="45%" valign="top" align="center">
      <img src="docs/assets/capturas/movil.png" alt="Vista móvil del dashboard y menú lateral abierto" width="100%">
      <p><b>Vista móvil (390 × 844)</b><br><sub>El menú lateral se convierte en un botón accesible con <code>aria-expanded</code>.</sub></p>
    </td>
    <td width="55%" valign="top">
      <img src="docs/assets/capturas/tooltip-tendencia.png" alt="Detalle al pasar el cursor sobre la gráfica de tendencia" width="100%">
      <p><b>Detalle al pasar el cursor</b><br><sub>Muestra importe en MXN y créditos de cada mes y género.</sub></p>
      <br>
      <img src="docs/assets/capturas/swagger.png" alt="Documentación Swagger de la API FastAPI" width="100%">
      <p><b>Swagger de la API</b><br><sub>Documentación interactiva de los 6 endpoints en <code>/docs</code>.</sub></p>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td valign="top">
      <img src="docs/assets/capturas/etl-consola.png" alt="Consola con la ejecución del ETL y verificación en PostgreSQL" width="100%">
      <p><b>Ejecución del ETL</b><br><sub>Carga de los 8 CSV oficiales y verificación de los registros en PostgreSQL.</sub></p>
    </td>
  </tr>
</table>

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

<a id="estructura-del-repositorio"></a>

<img src="docs/assets/ui/h-estructura-del-repositorio.svg" alt="Estructura del repositorio" width="100%">

```
DashboardCajaAhorro/
├── backend/
│   ├── app/
│   │   ├── db.py                 # Conexión a PostgreSQL (DATABASE_URL)
│   │   └── main.py               # Endpoints y cálculo de KPIs
│   └── requirements.txt
├── data/raw/                     # 8 CSV oficiales FONACOT 2025 + CSV de ejemplo
├── database/schema.sql           # Tablas, restricciones e índices
├── docs/
│   ├── aportacion-miguel-dashboard.md
│   ├── assets/                   # Banner y gráficos SVG del README
│   └── evidencias/               # Capturas oficiales
├── etl/
│   ├── extract_transform_load.py # Proceso ETL
│   ├── revisar_csv.py            # Revisión rápida de un CSV
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Estado, filtros y llamadas a la API
│   │   ├── components/           # Sidebar, FilterBar, KpiCard, ChartsSection, ChartDataTable, StateFeedback
│   │   ├── data/sampleDemoData.js
│   │   └── utils/                # Formatos, métricas y pruebas unitarias
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── .env.example
```

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

<a id="alcance-y-limitaciones"></a>

<img src="docs/assets/ui/h-alcance-y-limitaciones.svg" alt="Alcance y limitaciones" width="100%">

> <img src="docs/assets/ui/precaucion.svg" alt="Precaución" height="30">
>
> Las cifras son una **referencia del mercado FONACOT**, no los créditos internos de una caja de ahorro.

- Solo hay datos de **2025**, por trimestre; el crecimiento se mide trimestre contra trimestre.
- FONACOT registra créditos a **trabajadores formales**; no representa todo el crédito en Oaxaca.
- Los datos vienen agrupados por entidad, mes y género; no hay información por persona, municipio ni tipo de crédito.
- El modo demostración (`sampleDemoData.js`) se identifica en pantalla y no es evidencia oficial.
- El proyecto está pensado para ejecución local; no incluye autenticación ni configuración de despliegue en servidor.

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

<a id="equipo"></a>

<img src="docs/assets/ui/h-equipo.svg" alt="Equipo" width="100%">

<div align="center">
<table>
  <tr>
    <td align="center" width="33%" valign="top"><a href="https://github.com/noeEdwin"><img src="https://github.com/noeEdwin.png?size=120" width="80" alt="Edwin Noé Sánchez Chávez"></a><br><b>Edwin Noé</b><br>Sánchez Chávez<br><sub><b>Líder / Product Owner</b></sub><br><sub>Repositorio, issues, tablero y coordinación</sub><br><sub><a href="https://github.com/noeEdwin">@noeEdwin</a></sub></td>
    <td align="center" width="33%" valign="top"><a href="https://github.com/Melody-Mendoza"><img src="https://github.com/Melody-Mendoza.png?size=120" width="80" alt="Melody Nathalie Mendoza Jiménez"></a><br><b>Melody Nathalie</b><br>Mendoza Jiménez<br><sub><b>Analista</b></sub><br><sub>Fuentes de datos, fórmulas de KPIs, 5.1 y 5.2</sub><br><sub><a href="https://github.com/Melody-Mendoza">@Melody-Mendoza</a></sub></td>
    <td align="center" width="33%" valign="top"><a href="https://github.com/diegooash"><img src="https://github.com/diegooash.png?size=120" width="80" alt="Diego Alonso Sánchez Hernández"></a><br><b>Diego Alonso</b><br>Sánchez Hernández<br><sub><b>Programador 1</b></sub><br><sub>ETL en Python y carga a PostgreSQL</sub><br><sub><a href="https://github.com/diegooash">@diegooash</a></sub></td>
  </tr>
  <tr>
    <td align="center" width="33%" valign="top"><a href="https://github.com/cecDev-X"><img src="https://github.com/cecDev-X.png?size=120" width="80" alt="Carlos Eduardo Castellanos Ríos"></a><br><b>Carlos Eduardo</b><br>Castellanos Ríos<br><sub><b>Programador 2</b></sub><br><sub>API REST en FastAPI</sub><br><sub><a href="https://github.com/cecDev-X">@cecDev-X</a></sub></td>
    <td align="center" width="33%" valign="top"><a href="https://github.com/Angixs-zz"><img src="https://github.com/Angixs-zz.png?size=120" width="80" alt="Miguel Ángel Hernández Pérez"></a><br><b>Miguel Ángel</b><br>Hernández Pérez<br><sub><b>Diseñador</b></sub><br><sub>Interfaz en React, accesibilidad y gráficas</sub><br><sub><a href="https://github.com/Angixs-zz">@Angixs-zz</a></sub></td>
    <td align="center" width="33%" valign="top"><a href="https://github.com/Angel-2329"><img src="https://github.com/Angel-2329.png?size=120" width="80" alt="Ángel de Jesús Méndez García"></a><br><b>Ángel de Jesús</b><br>Méndez García<br><sub><b>QA / Tester</b></sub><br><sub>Pruebas de integridad y evidencias</sub><br><sub><a href="https://github.com/Angel-2329">@Angel-2329</a></sub></td>
  </tr>
</table>

Docente: <b>Hernández Luis Moisés Adrián</b>
</div>

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

<a id="como-contribuir"></a>

<img src="docs/assets/ui/h-como-contribuir.svg" alt="Cómo contribuir" width="100%">

1. Actualiza `main` (Fetch y Pull).
2. Crea una rama desde `main` con prefijo según el tipo de cambio: `feat/…`, `fix/…`, `docs/…` o `qa/…`.
3. Haz commits pequeños con mensajes descriptivos, por ejemplo `fix(frontend): …` o `docs(readme): …`.
4. Abre un Pull Request hacia `main` e indica el issue relacionado (`Refs #N`).

> <img src="docs/assets/ui/nota.svg" alt="Nota" height="30">
>
> Nadie trabaja directamente en `main`. El seguimiento está en el [tablero del sprint](https://github.com/users/noeEdwin/projects/6).

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

<a id="referencias"></a>

<img src="docs/assets/ui/h-referencias.svg" alt="Referencias" width="100%">

- Instituto FONACOT. *Trabajadores con crédito ejercido por género y entidad federativa* [conjunto de datos]. [datos.gob.mx](https://www.datos.gob.mx/dataset/trabajadores_credito_ejercido_genero_entidad_federativa)
- Instituto FONACOT. *Importe de créditos ejercidos por género y entidad federativa* [conjunto de datos]. [datos.gob.mx](https://www.datos.gob.mx/dataset/importe_creditos_ejercidos_genero_entidad-federativa)
- Instituto FONACOT. [*Diccionario de datos abiertos*](https://www.fonacot.gob.mx/TransparenciaRendicionCuentas/Documents/Datos%20Abiertos/2023/Diccionario%20Conjunto%20de%20Datos.pdf)
- Schwaber, K. y Sutherland, J. (2020). [*La Guía de Scrum*](https://scrumguides.org)
- [Documentación de FastAPI](https://fastapi.tiangolo.com) · [Documentación de React](https://react.dev) · [Documentación de PostgreSQL 16](https://www.postgresql.org/docs/16/)

---

<img src="docs/assets/footer.svg" alt="Equipo Omadas, Instituto Tecnológico de Oaxaca, 2026" width="100%">

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>
