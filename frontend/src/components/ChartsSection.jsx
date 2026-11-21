import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMXN, formatNum, formatPct, formatPeriodo } from "../utils/formatters";

const COLOR_MUJER = "#be185d";
const COLOR_HOMBRE = "#1d4ed8";

function getGenderColor(genero) {
  return String(genero).toLowerCase() === "mujer" ? COLOR_MUJER : COLOR_HOMBRE;
}

function TendenciaTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-title">{formatPeriodo(label)} ({label})</p>
      {payload.map((entry) => {
        const creditosKey = `${entry.dataKey}_creditos`;
        const creditos = entry.payload?.[creditosKey];
        return (
          <div key={entry.dataKey} className="tooltip-row">
            <span
              className="tooltip-dot"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span className="tooltip-label">{entry.name}:</span>
            <strong className="tooltip-value">{formatMXN(entry.value)}</strong>
            {creditos !== undefined && (
              <span className="tooltip-extra">({formatNum(creditos)} créd.)</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function GeneroTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-title">{row.genero}</p>
      <div className="tooltip-row">
        <span className="tooltip-label">Monto ejercido:</span>
        <strong className="tooltip-value">{formatMXN(row.monto_mxn)}</strong>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">Ticket promedio:</span>
        <strong className="tooltip-value">{formatMXN(row.ticket_promedio_mxn)}</strong>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">Créditos:</span>
        <strong className="tooltip-value">{formatNum(row.creditos)}</strong>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">Trabajadores:</span>
        <strong className="tooltip-value">{formatNum(row.trabajadores)}</strong>
      </div>
    </div>
  );
}

export default function ChartsSection({
  tendencia,
  porGenero,
  generoSeleccionado,
  kpis,
}) {
  const showMujer = generoSeleccionado === "Todos" || generoSeleccionado === "Mujer";
  const showHombre = generoSeleccionado === "Todos" || generoSeleccionado === "Hombre";

  const porGeneroFiltrado =
    generoSeleccionado === "Todos"
      ? porGenero
      : porGenero.filter(
          (item) => item.genero.toLowerCase() === generoSeleccionado.toLowerCase()
        );

  const oaxacaPct = kpis ? Number(kpis.participacion_oaxaca_nacional_pct) || 0 : 0;

  return (
    <section className="charts-section" aria-label="Visualizaciones y gráficas financieras">
      <article id="tendencia" className="chart-card chart-card--wide">
        <div className="chart-header">
          <div>
            <h3>8. Tendencia Mensual de Colocación en Oaxaca (MXN)</h3>
            <p className="chart-subtitle">
              Evolución del importe ejercido por periodo y género. Unidades en millones de pesos (MXN).
            </p>
          </div>
          <div className="chart-legend-pills" aria-label="Leyenda de series">
            {showMujer && (
              <span className="legend-pill legend-pill--mujer">
                <span className="legend-swatch" aria-hidden="true" /> Mujer (línea continua)
              </span>
            )}
            {showHombre && (
              <span className="legend-pill legend-pill--hombre">
                <span className="legend-swatch" aria-hidden="true" /> Hombre (línea discontinua)
              </span>
            )}
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={tendencia}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="periodo"
                tickFormatter={formatPeriodo}
                tick={{ fill: "#334155", fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`}
                tick={{ fill: "#334155", fontSize: 12 }}
                width={64}
              />
              <Tooltip content={<TendenciaTooltip />} />
              <Legend />
              {showMujer && (
                <Line
                  type="monotone"
                  dataKey="Mujer"
                  name="Mujer (MXN)"
                  stroke={COLOR_MUJER}
                  strokeWidth={2.75}
                  dot={{ r: 4, fill: COLOR_MUJER }}
                  activeDot={{ r: 6 }}
                />
              )}
              {showHombre && (
                <Line
                  type="monotone"
                  dataKey="Hombre"
                  name="Hombre (MXN)"
                  stroke={COLOR_HOMBRE}
                  strokeWidth={2.75}
                  strokeDasharray="6 3"
                  dot={{ r: 4, fill: COLOR_HOMBRE }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <div className="charts-grid">
        <article id="genero" className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Comparativa de Monto Ejercido por Género (Oaxaca)</h3>
              <p className="chart-subtitle">
                Importe acumulado en MXN y volumen de créditos por género.
              </p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={porGeneroFiltrado}
                margin={{ top: 10, right: 16, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="genero" tick={{ fill: "#334155", fontSize: 13 }} />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`}
                  tick={{ fill: "#334155", fontSize: 12 }}
                  width={64}
                />
                <Tooltip content={<GeneroTooltip />} />
                <Bar
                  dataKey="monto_mxn"
                  name="Monto Ejercido (MXN)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={84}
                >
                  {porGeneroFiltrado.map((entry) => (
                    <Cell
                      key={entry.genero}
                      fill={getGenderColor(entry.genero)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article id="brecha-ticket" className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Ticket Promedio por Género (Oaxaca)</h3>
              <p className="chart-subtitle">
                Monto promedio por crédito ejercido en MXN (KPI 3 y KPI 5).
              </p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={porGeneroFiltrado}
                layout="vertical"
                margin={{ top: 5, right: 24, left: 12, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `$${(v / 1e3).toFixed(0)}k`}
                  tick={{ fill: "#334155", fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="genero"
                  tick={{ fill: "#1e293b", fontSize: 13, fontWeight: 600 }}
                  width={74}
                />
                <Tooltip content={<GeneroTooltip />} />
                <Bar
                  dataKey="ticket_promedio_mxn"
                  name="Ticket Promedio (MXN)"
                  radius={[0, 8, 8, 0]}
                  maxBarSize={42}
                >
                  {porGeneroFiltrado.map((entry) => (
                    <Cell
                      key={entry.genero}
                      fill={getGenderColor(entry.genero)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {kpis && (
            <div className="national-share-box">
              <div className="national-share-header">
                <span>7. Peso de Oaxaca respecto al Total Nacional</span>
                <strong>{formatPct(oaxacaPct)}</strong>
              </div>
              <div
                className="kpi-progress-track"
                role="progressbar"
                aria-valuenow={Math.round(oaxacaPct)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Participación de Oaxaca respecto al total nacional"
              >
                <div
                  className="kpi-progress-fill kpi-progress-fill--teal"
                  style={{ width: `${Math.min(100, Math.max(oaxacaPct * 4, oaxacaPct > 0 ? 4 : 0))}%` }}
                />
              </div>
              <p className="national-share-note">
                Calculado sobre el importe total nacional del periodo seleccionado.
              </p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
