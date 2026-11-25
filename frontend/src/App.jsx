import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import FilterBar from "./components/FilterBar";
import KpiCard from "./components/KpiCard";
import ChartsSection from "./components/ChartsSection";
import {
  EmptyState,
  ErrorBanner,
  LoadingSkeleton,
} from "./components/StateFeedback";
import { getSampleDashboardData, SAMPLE_FILTROS } from "./data/sampleDemoData";
import { formatMXN, formatNum, formatPct, formatPeriodo } from "./utils/formatters";
import { lastPeriodSummary } from "./utils/metrics";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function buildTendenciaSeries(rows) {
  const byPeriod = {};
  (rows || []).forEach((row) => {
    // Sólo se crean claves para los géneros que devuelve la API: así un filtro
    // por género no dibuja series en cero y se conservan otros géneros
    // (p. ej. «No especificado») si llegan desde el ETL.
    if (!byPeriod[row.periodo]) {
      byPeriod[row.periodo] = { periodo: row.periodo };
    }
    byPeriod[row.periodo][row.genero] = Number(row.monto_mxn) || 0;
    byPeriod[row.periodo][`${row.genero}_creditos`] = Number(row.creditos) || 0;
  });
  return Object.values(byPeriod).sort((a, b) =>
    a.periodo.localeCompare(b.periodo)
  );
}

export default function App() {
  const [anio, setAnio] = useState("");
  const [genero, setGenero] = useState("Todos");
  const [filtros, setFiltros] = useState({ anios: [], generos: [] });
  const [kpis, setKpis] = useState(null);
  const [porGenero, setPorGenero] = useState([]);
  const [tendencia, setTendencia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [activeSection, setActiveSection] = useState("resumen");

  useEffect(() => {
    if (isDemoMode) {
      setFiltros(SAMPLE_FILTROS);
      return;
    }

    const controller = new AbortController();
    fetch(`${API_URL}/api/filtros`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setFiltros({
          anios: Array.isArray(data.anios) ? data.anios : [],
          generos: Array.isArray(data.generos) ? data.generos : [],
        });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setFiltros({ anios: [], generos: [] });
        setError(`No se pudo conectar con la API en ${API_URL}`);
      });

    return () => controller.abort();
  }, [isDemoMode, retryCount]);

  useEffect(() => {
    if (isDemoMode) {
      const sample = getSampleDashboardData(anio, genero);
      setKpis(sample.kpis);
      setPorGenero(sample.porGenero);
      setTendencia(buildTendenciaSeries(sample.tendenciaRows));
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();
    if (anio) params.append("anio", anio);
    if (genero && genero !== "Todos") params.append("genero", genero);
    const qs = params.toString() ? `?${params.toString()}` : "";

    setLoading(true);
    setError("");

    Promise.all([
      fetch(`${API_URL}/api/kpis${qs}`, { signal: controller.signal }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
      fetch(`${API_URL}/api/genero${anio ? `?anio=${anio}` : ""}`, {
        signal: controller.signal,
      }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
      fetch(`${API_URL}/api/tendencia${qs}`, { signal: controller.signal }).then(
        (r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        }
      ),
    ])
      .then(([kpiRes, genRes, tendRes]) => {
        setKpis(kpiRes.kpis || null);
        setPorGenero(genRes.data || []);
        setTendencia(buildTendenciaSeries(tendRes.data));
        setError("");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setKpis(null);
        setPorGenero([]);
        setTendencia([]);
        setError("Error al cargar métricas desde FastAPI.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [anio, genero, isDemoMode, retryCount]);

  const handleResetFilters = useCallback(() => {
    setAnio("");
    setGenero("Todos");
  }, []);

  const handleRetry = useCallback(() => {
    setIsDemoMode(false);
    setError("");
    setRetryCount((c) => c + 1);
  }, []);

  const handleLoadDemo = useCallback(() => {
    setIsDemoMode(true);
    setError("");
  }, []);

  const ultimoPeriodo = useMemo(
    () => lastPeriodSummary(tendencia, genero),
    [tendencia, genero]
  );

  const isEmpty =
    !loading &&
    !error &&
    kpis &&
    Number(kpis.total_creditos) === 0 &&
    tendencia.length === 0;

  const crecimientoVal = kpis ? Number(kpis.crecimiento_periodo_pct) || 0 : 0;
  const crecimientoTone =
    crecimientoVal > 0 ? "positive" : crecimientoVal < 0 ? "alert" : "neutral";
  const crecimientoLabel =
    crecimientoVal > 0 ? "Alza" : crecimientoVal < 0 ? "Baja" : "Estable";

  const brechaDisponible =
    kpis &&
    kpis.brecha_ticket_genero_mxn !== null &&
    kpis.brecha_ticket_genero_mxn !== undefined;
  const brechaVal = brechaDisponible ? Number(kpis.brecha_ticket_genero_mxn) || 0 : 0;
  const brechaTexto = !brechaDisponible
    ? "Requiere ambos géneros"
    : brechaVal > 0
    ? "Mayor en hombres"
    : brechaVal < 0
    ? "Mayor en mujeres"
    : "Sin brecha";

  return (
    <div className="layout">
      <a className="skip-link" href="#main-content">
        Saltar al contenido principal
      </a>

      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        isDemoMode={isDemoMode}
      />

      <main id="main-content" className="content" tabIndex={-1}>
        <FilterBar
          anio={anio}
          genero={genero}
          filtros={filtros}
          loading={loading}
          isDemoMode={isDemoMode}
          onAnioChange={setAnio}
          onGeneroChange={setGenero}
          onResetFilters={handleResetFilters}
        />

        <ErrorBanner
          message={error}
          apiUrl={API_URL}
          onRetry={handleRetry}
          onLoadDemo={handleLoadDemo}
          isDemoMode={isDemoMode}
        />

        {loading ? (
          <LoadingSkeleton />
        ) : isEmpty ? (
          <EmptyState
            anio={anio}
            genero={genero}
            onReset={handleResetFilters}
          />
        ) : (
          kpis && (
            <>
              <section
                id="resumen"
                className="kpi-section"
                aria-labelledby="heading-kpis"
              >
                <div className="section-header">
                  <h3 id="heading-kpis">Resumen ejecutivo de indicadores</h3>
                  <span className="section-meta">
                    Selección actual:{" "}
                    <strong>{anio ? `Año ${anio}` : "Todos los años"}</strong>,{" "}
                    <strong>{genero}</strong>
                  </span>
                </div>

                <div className="kpi-hero-grid">
                  <KpiCard
                    featured
                    title="Monto total financiado en Oaxaca"
                    value={formatMXN(kpis.monto_total_mxn, 2)}
                    subtitle="Importe acumulado ejercido en pesos mexicanos"
                    badgeText="Oaxaca"
                    badgeTone="emerald"
                  />
                  <KpiCard
                    featured
                    title="Créditos ejercidos en Oaxaca"
                    value={formatNum(kpis.total_creditos)}
                    subtitle={`${formatNum(kpis.total_trabajadores)} trabajadores beneficiados en el periodo`}
                    progressPct={Number(kpis.participacion_mujeres_pct) || 0}
                    progressLabel="Distribución porcentual de mujeres y hombres en créditos"
                    splitBar
                    badgeText={`${formatPct(kpis.participacion_mujeres_pct, 1)} mujeres`}
                    badgeTone="info"
                  />
                </div>

                <div className="kpi-grid">
                  <KpiCard
                    title="Ticket promedio por crédito"
                    value={formatMXN(kpis.ticket_promedio_mxn, 2)}
                    subtitle="Monto total entre total de créditos"
                  />
                  <KpiCard
                    title="Participación por género"
                    value={`${formatPct(kpis.participacion_mujeres_pct, 1)} / ${formatPct(
                      kpis.participacion_hombres_pct,
                      1
                    )}`}
                    subtitle="Mujeres frente a hombres (% de créditos)"
                    progressPct={Number(kpis.participacion_mujeres_pct) || 0}
                    progressLabel="Porcentaje de participación de mujeres en créditos"
                    splitBar
                  />
                  <KpiCard
                    title="Brecha de ticket por género"
                    value={brechaDisponible ? formatMXN(Math.abs(brechaVal), 2) : "N/A"}
                    subtitle={
                      brechaDisponible
                        ? "Diferencia promedio Hombre frente a Mujer"
                        : "Selecciona Todos en género para comparar"
                    }
                    badgeText={brechaTexto}
                    badgeTone={!brechaDisponible || brechaVal === 0 ? "neutral" : "info"}
                  />
                  <KpiCard
                    title="Crecimiento entre periodos"
                    value={formatPct(crecimientoVal)}
                    subtitle={kpis.crecimiento_detalle || "Variación trimestral en Oaxaca"}
                    badgeText={crecimientoLabel}
                    badgeTone={crecimientoTone}
                  />
                  <KpiCard
                    title="Participación Oaxaca / Nacional"
                    value={formatPct(kpis.participacion_oaxaca_nacional_pct)}
                    subtitle="Peso sobre el importe nacional ejercido"
                  />
                  <KpiCard
                    title="Último periodo registrado"
                    value={
                      ultimoPeriodo ? formatMXN(ultimoPeriodo.monto) : "Sin datos"
                    }
                    subtitle={
                      ultimoPeriodo
                        ? `${formatPeriodo(ultimoPeriodo.periodo)} (${formatNum(
                            ultimoPeriodo.creditos
                          )} créditos)`
                        : "Sin serie temporal disponible"
                    }
                  />
                </div>
              </section>

              <ChartsSection
                tendencia={tendencia}
                porGenero={porGenero}
                generoSeleccionado={genero}
                kpis={kpis}
              />
            </>
          )
        )}

        <footer className="dashboard-footer">
          <p>
            <strong>Horizonte Cooperativo, Oaxaca</strong>. Fuente oficial:{" "}
            datos.gob.mx (FONACOT 2025).{" "}
            {isDemoMode
              ? "Modo demostración activo con datos de ejemplo (sample_oaxaca_creditos.csv)."
              : "Datos consultados en vivo desde FastAPI y PostgreSQL."}
          </p>
        </footer>
      </main>
    </div>
  );
}
