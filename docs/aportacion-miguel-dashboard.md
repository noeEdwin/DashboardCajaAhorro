# Aportación de Miguel Ángel Hernández Pérez — Frontend y Validación con Datos Oficiales (#7 y #8)

Material técnico y de evidencias para las secciones **5.5 Implementación del frontend** y **5.5.2 Visualización efectiva** del documento final del proyecto *Horizonte Cooperativo — Dashboard Financiero (Enfoque Oaxaca)*.

Todas las cifras, consultas y capturas de este documento corresponden a la ejecución real del sistema completo (**ETL Python → PostgreSQL 16 → FastAPI → React + Vite + Recharts**) con los **8 archivos CSV oficiales de FONACOT 2025 (1T–4T)** ubicados en `data/raw/`.

---

## 5.5 Implementación del frontend

La interfaz de usuario se desarrolló en **React 18**, **Vite 5**, **Recharts 2** y **CSS3** (`frontend/src/`), consumiendo en tiempo real los endpoints de FastAPI (`/api/filtros`, `/api/kpis`, `/api/genero` y `/api/tendencia`).

### Arquitectura de componentes

- `App.jsx`: Orquestación de estado, filtros activos (`anio`, `genero`), cancelación de peticiones concurrentes mediante `AbortController`, manejo de estados (`loading`, `error`, `isEmpty`) y modo demostración explícito (`sampleDemoData.js`).
- `Sidebar.jsx`: Barra lateral de navegación fija en escritorio y colapsable en móvil (`menu-toggle` con `aria-expanded` y `aria-controls`), con indicador de estado en vivo (*Datos oficiales FONACOT 2025*).
- `FilterBar.jsx`: Controles `<select>` etiquetados para **Año** y **Género**, botón **Limpiar filtros** y región `aria-live="polite"` para anunciar actualizaciones.
- `KpiCard.jsx`: Tarjeta reutilizable para los 8 indicadores clave, con soporte para tarjetas destacadas (`featured`), insignias de contexto (`badgeTone`), barras de proporción accesibles (`role="progressbar"`) y tipografía tabular (`tabular-nums`).
- `ChartsSection.jsx`: Renderizado responsivo de las tres visualizaciones en Recharts, tooltips personalizados con alto contraste, leyenda textual de series y tabla de auditoría operativa por género.
- `ChartDataTable.jsx`: Alternativa textual desplegable (`<details>`) bajo cada gráfica SVG para consultar exactamente los mismos datos en tabla HTML semántica.
- `StateFeedback.jsx`: Esqueleto de carga (`LoadingSkeleton`), banner de error con reintento (`ErrorBanner`) y estado vacío (`EmptyState`).
- `utils/metrics.js`, `utils/formatters.js` y `utils/useReducedMotion.js`: Funciones puras de formato (`es-MX`), cálculo de barras, soporte dinámico para otros géneros (incluido *«No especificado»*) y detección de preferencia del sistema `prefers-reduced-motion`.

---

## 5.5.2 Visualización efectiva

### Descripción de los ocho KPIs implementados (Oaxaca 2025, sin filtro activo)

| # | Indicador | Fórmula / Fuente API | Cifra oficial verificada (Oaxaca 2025) |
|---|---|---|---|
| 1 | **Monto total financiado en Oaxaca** | `SUM(importe_ejercido_mxn)` en `/api/kpis` | **$675,334,814.51** |
| 2 | **Créditos ejercidos en Oaxaca** | `SUM(numero_creditos)` y `SUM(numero_trabajadores)` | **24,048** (24,048 trabajadores) |
| 3 | **Ticket promedio por crédito** | `monto_total_mxn / total_creditos` | **$28,082.79** |
| 4 | **Participación por género** | `% créditos Mujer / % créditos Hombre` | **41.6% / 58.4%** (41.58% / 58.42%) |
| 5 | **Brecha de ticket por género** | `ticket_hombre - ticket_mujer` (N/A si se filtra un solo género) | **$1,129.93** (Mayor en hombres) |
| 6 | **Crecimiento entre periodos** | Variación `4T 2025 vs. 3T 2025` (respetando filtros) | **−11.09%** (Baja) |
| 7 | **Participación Oaxaca / Nacional** | `monto_oaxaca / monto_nacional * 100` (incluye App Móvil) | **1.01%** (sobre $66,770,326,410.19) |
| 8 | **Último periodo registrado** | Último mes en `/api/tendencia` (`2025-12`) | **$42,129,664** (Dic 2025, 1,518 créditos) |

### Explicación de las tres gráficas

1. **Tendencia mensual de colocación en Oaxaca (`#tendencia`, `LineChart`)**: Muestra la evolución mes a mes (Ene 2025 – Dic 2025) del importe ejercido en millones de pesos por género. Diferencia las series por color y patrón de trazo (*Mujer* línea continua `#A21C58`, *Hombre* línea discontinua `#1D4E89`, y otros géneros línea punteada `#0B6E5C`).
2. **Monto ejercido por género (`#genero`, `BarChart` vertical)**: Compara el importe acumulado en Oaxaca entre mujeres ($274,199,325.51 MXN) y hombres ($401,135,489.00 MXN).
3. **Ticket promedio por género (`#brecha-ticket`, `BarChart` horizontal)**: Contrasta el monto promedio por crédito otorgado ($27,422.67 MXN en mujeres frente a $28,552.60 MXN en hombres) e incluye la barra de peso Oaxaca / Nacional (`1.01%`).

Debajo de las gráficas se presenta la tabla **Detalle operativo por género en Oaxaca** (`#tabla-operativa`) con cifras exactas conciliadas con PostgreSQL.

### Filtros interactivos

Los selectores de **Año** (`Todos los años`, `2025`) y **Género** (`Todos`, `Hombre`, `Mujer`) consultan en vivo a FastAPI y actualizan simultáneamente los 8 KPIs, las 3 gráficas y la tabla operativa. El botón **Limpiar filtros** aparece cuando hay algún filtro activo y restablece la vista general.

### Accesibilidad y diseño responsive

- **Navegación por teclado y lectores de pantalla**: Enlace *«Saltar al contenido principal»* (`skip-link`), foco visible (`:focus-visible` de 3px), etiquetas `<label>` asociadas, regiones `aria-live="polite"` y `role="progressbar"` con valores `aria-valuenow/min/max`.
- **Alternativa tabular en gráficas**: Cada gráfica incluye un desplegable *«Consultar datos de la gráfica en tabla»* (`ChartDataTable`) con encabezados `<th scope="col">` y `<th scope="row">`.
- **Movimiento reducido**: `useReducedMotion` desactiva la animación JavaScript de Recharts cuando el usuario tiene activado `prefers-reduced-motion: reduce`.
- **Diseño responsive**: Verificado sin desbordamiento horizontal (`scrollWidth <= innerWidth`) en escritorio (`1920×1080`), tablet (`768×1024`) y móvil (`390×844` con menú hamburguesa accesible).

---

## Evidencias y resultados de pruebas (#7)

### 1. Conciliación triple: CSV oficiales vs. SQL directo en PostgreSQL vs. API FastAPI

Se contrastaron las 9 combinaciones de filtros (`Año` ∈ `{Todos, 2025, 2024}`, `Género` ∈ `{Todos, Mujer, Hombre}`) comparando:
1. Lectura directa de los 8 CSV `data/raw/fonacot_*_2025T*.csv` en Python (`decimal.Decimal`).
2. Consultas SQL independientes sobre la tabla `creditos_entidad_genero` en PostgreSQL 16.
3. Respuestas JSON reales de FastAPI (`/api/kpis`, `/api/tendencia`, `/api/comparativa-nacional`).

| Filtro | Créditos (Oaxaca) | Monto Oaxaca (MXN) | Ticket Prom. | Crecimiento 4T vs 3T | Oaxaca / Nac. | Resultado |
|---|---|---|---|---|---|---|
| Sin filtro / 2025 — Todos | 24,048 | $675,334,814.51 | $28,082.79 | -11.09% | 1.01% | **PASA (0 diferencias)** |
| 2025 — Mujer | 9,999 | $274,199,325.51 | $27,422.67 | -10.88% | 1.06% | **PASA (0 diferencias)** |
| 2025 — Hombre | 14,049 | $401,135,489.00 | $28,552.60 | -11.23% | 0.98% | **PASA (0 diferencias)** |
| 2024 — Todos / Mujer / Hombre | 0 | $0.00 | $0.00 | 0.00% | 0.00% | **PASA (estado vacío)** |

- **Endpoints FastAPI verificados (`HTTP 200`)**: `/health`, `/api/filtros`, `/api/kpis`, `/api/genero`, `/api/tendencia`, `/api/comparativa-nacional`.
- **Sin `NaN` ni `Infinity`** en las respuestas JSON ni en los textos renderizados.

### 2. Pruebas de frontend y navegador real (Playwright / Chromium)

- **Pruebas unitarias (`node --test src/utils/dashboard.test.mjs`)**: **5/5 aprobadas**.
- **Compilación de producción (`npm run build`)**: **Exitosa** (sin errores).
- **Validación E2E en navegador (`1920×1080`, `390×844` y `768×1024`)**: **178/178 comprobaciones aprobadas**, incluyendo cifras KPI vs. SQL, renderizado de 12 puntos en serie mensual, 3 tablas accesibles desplegables, tooltips, teclado, error simulado de API sin datos obsoletos y cero desbordamiento horizontal.

### 3. Capturas de evidencia (datos oficiales FONACOT 2025)

| Captura | Descripción |
|---|---|
| [Vista completa escritorio 1080p](evidencias/dashboard-escritorio-1080p-oficial.png) | Dashboard completo con datos oficiales (8 KPIs, 3 gráficas y tabla operativa). |
| [Vista inicial escritorio 1080p](evidencias/dashboard-escritorio-vista-inicial.png) | Primer pantallazo al abrir la aplicación en 1920×1080. |
| [Tarjetas de los 8 KPIs](evidencias/dashboard-8-kpis-oficial.png) | Detalle de los 8 KPIs conciliados con PostgreSQL. |
| [Tres gráficas y tabla operativa](evidencias/dashboard-3-graficas-y-tabla.png) | Tendencia mensual, monto por género, ticket promedio y tabla de auditoría. |
| [Filtro Año=2025, Género=Mujer](evidencias/dashboard-filtro-2025-mujer.png) | Actualización dinámica de KPIs y gráficas; brecha marcada como `N/A` (*Requiere ambos géneros*). |
| [Tabla accesible desplegada](evidencias/dashboard-tabla-accesible-tendencia.png) | Tabla consultable de los 12 periodos bajo la gráfica de tendencia. |
| [Tooltip de tendencia mensual](evidencias/dashboard-tooltip-tendencia.png) | Tooltip de Dic 2025 mostrando importes y número de créditos por género. |
| [Vista completa móvil 390×844](evidencias/dashboard-movil-390x844-oficial.png) | Diseño responsive en móvil sin desbordamiento horizontal. |
| [Menú móvil desplegado](evidencias/dashboard-movil-menu-abierto.png) | Navegación móvil accesible (`aria-expanded="true"`). |
| [Estado de error de API](evidencias/dashboard-estado-error-api.png) | Manejo amigable ante caída de API y enfoque por teclado del enlace de salto. |
