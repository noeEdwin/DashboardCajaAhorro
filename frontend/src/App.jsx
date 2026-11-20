import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const formatMXN = (val) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(val || 0);

const formatNum = (val) => new Intl.NumberFormat("es-MX").format(val || 0);

export default function App() {
  const [anio, setAnio] = useState("");
  const [genero, setGenero] = useState("Todos");
  const [filtros, setFiltros] = useState({ anios: [], generos: [] });
  const [kpis, setKpis] = useState(null);
  const [porGenero, setPorGenero] = useState([]);
  const [tendencia, setTendencia] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/filtros`)
      .then((res) => res.json())
      .then((data) => setFiltros(data))
      .catch(() => setError("No se pudo conectar con la API en " + API_URL));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (anio) params.append("anio", anio);
    if (genero && genero !== "Todos") params.append("genero", genero);
    const qs = params.toString() ? `?${params.toString()}` : "";

    Promise.all([
      fetch(`${API_URL}/api/kpis${qs}`).then((r) => r.json()),
      fetch(`${API_URL}/api/genero${anio ? `?anio=${anio}` : ""}`).then((r) => r.json()),
      fetch(`${API_URL}/api/tendencia${qs}`).then((r) => r.json()),
    ])
      .then(([kpiRes, genRes, tendRes]) => {
        setKpis(kpiRes.kpis);
        setPorGenero(genRes.data || []);

        const byPeriod = {};
        (tendRes.data || []).forEach((row) => {
          if (!byPeriod[row.periodo]) {
            byPeriod[row.periodo] = { periodo: row.periodo, Mujer: 0, Hombre: 0 };
          }
          byPeriod[row.periodo][row.genero] = Number(row.monto_mxn);
        });
        setTendencia(Object.values(byPeriod));
        setError("");
      })
      .catch(() => setError("Error al cargar métricas desde FastAPI."));
  }, [anio, genero]);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <h1>Horizonte</h1>
          <span>COOPERATIVO · OAXACA</span>
        </div>
        <nav>
          <a className="active" href="#resumen">Resumen Gerencial</a>
          <a href="#genero">Brecha de Género</a>
          <a href="#tendencia">Tendencia Mensual</a>
        </nav>
        <div className="sidebar-footer">
          <small>Fuente: datos.gob.mx (FONACOT)</small>
          <small>Equipo Omadas · ITO TecNM</small>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h2>Dashboard Financiero — Créditos Ejercidos en Oaxaca</h2>
            <p className="subtitle">Monitoreo de colocación, ticket promedio y participación por género</p>
          </div>
          <div className="filters">
            <label>
              Año:
              <select value={anio} onChange={(e) => setAnio(e.target.value)}>
                <option value="">Todos</option>
                {filtros.anios.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>
            <label>
              Género:
              <select value={genero} onChange={(e) => setGenero(e.target.value)}>
                <option value="Todos">Todos</option>
                {filtros.generos.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>
          </div>
        </header>

        {error && <div className="alert-error">{error}</div>}

        {kpis && (
          <section id="resumen" className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">1. Créditos Ejercidos (Oaxaca)</span>
              <strong className="kpi-value">{formatNum(kpis.total_creditos)}</strong>
              <span className="kpi-sub">{formatNum(kpis.total_trabajadores)} trabajadores</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">2. Monto Total Financiado</span>
              <strong className="kpi-value">{formatMXN(kpis.monto_total_mxn)}</strong>
              <span className="kpi-sub">Importe acumulado MXN</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">3. Ticket Promedio</span>
              <strong className="kpi-value">{formatMXN(kpis.ticket_promedio_mxn)}</strong>
              <span className="kpi-sub">Monto promedio por crédito</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">4. Participación Mujeres / Hombres</span>
              <strong className="kpi-value">
                {kpis.participacion_mujeres_pct}% / {kpis.participacion_hombres_pct}%
              </strong>
              <span className="kpi-sub">Distribución de créditos</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">5. Brecha de Ticket por Género</span>
              <strong className="kpi-value">{formatMXN(kpis.brecha_ticket_genero_mxn)}</strong>
              <span className="kpi-sub">Diferencia promedio H vs. M</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">6. Crecimiento Anual Oaxaca</span>
              <strong className="kpi-value">{kpis.crecimiento_periodo_pct}%</strong>
              <span className="kpi-sub">Variación último año</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">7. Participación Oaxaca / Nacional</span>
              <strong className="kpi-value">{kpis.participacion_oaxaca_nacional_pct}%</strong>
              <span className="kpi-sub">Peso sobre el total nacional</span>
            </div>
          </section>
        )}

        <section className="charts-grid">
          <div id="genero" className="chart-card">
            <h3>Comparativa de Monto Ejercido por Género (Oaxaca)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={porGenero}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="genero" />
                <YAxis tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} />
                <Tooltip formatter={(val) => formatMXN(val)} />
                <Legend />
                <Bar dataKey="monto_mxn" name="Monto Ejercido (MXN)" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div id="tendencia" className="chart-card">
            <h3>8. Tendencia Mensual de Colocación en Oaxaca</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={tendencia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} />
                <Tooltip formatter={(val) => formatMXN(val)} />
                <Legend />
                <Line type="monotone" dataKey="Mujer" stroke="#db2777" strokeWidth={2.5} />
                <Line type="monotone" dataKey="Hombre" stroke="#1d4ed8" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}
