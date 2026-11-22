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
import { percentBarWidth } from "../utils/metrics";

const COLOR_MUJER = "#A21C58";
const COLOR_HOMBRE = "#1D4E89";

function getGenderColor(genero) {
  return String(genero).toLowerCase() === "mujer" ? COLOR_MUJER : COLOR_HOMBRE;
}

function TendenciaTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="custom-tooltip">
      <p className="tooltip-title">{formatPeriodo(label)}</p>
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
        <strong className="tooltip-value">{formatMXN(row.monto_mxn, 2)}</strong>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">Ticket promedio:</span>
        <strong className="tooltip-value">{formatMXN(row.ticket_promedio_mxn, 2)}</strong>
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

  const totalCreditosTabla = porGeneroFiltrado.reduce(
    (acc, item) => acc + (Number(item.creditos) || 0),
    0
  );
  const totalMontoTabla = porGeneroFiltrado.reduce(
    (acc, item) => acc + (Number(item.monto_mxn) || 0),
    0
  );

  const oaxacaPct = kpis ? Number(kpis.participacion_oaxaca_nacional_pct) || 0 : 0;
  const shareWidth = percentBarWidth(oaxacaPct);

  return (
    <section className="charts-section" aria-label="Visualizaciones y gráficas financieras">
      <article id="tendencia" className="chart-card chart-card--wide">
        <div className="chart-header">
          <div>
            <h3>Tendencia mensual de colocación en Oaxaca</h3>
            <p className="chart-subtitle">
              Evolución del importe ejercido por mes y género en millones de pesos (MXN).
            </p>
          </div>
          <div className="chart-legend-pills" aria-label="Leyenda de series">
            {showMujer && (
              <span className="legend-pill legend-pill--mujer">
                <span className="legend-swatch" aria-hidden="true" /> Mujer (continua)
              </span>
            )}
            {showHombre && (
              <span className="legend-pill legend-pill--hombre">
                <span className="legend-swatch" aria-hidden="true" /> Hombre (discontinua)
              </span>
            )}
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={tendencia}
              margin={{ top: 10, right: 16, left: 4, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#DCE2DF" />
              <XAxis
                dataKey="periodo"
                tickFormatter={formatPeriodo}
                tick={{ fill: "#3B4A46", fontSize: 12 }}
                interval="preserveStartEnd"
                minTickGap={18}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`}
                tick={{ fill: "#3B4A46", fontSize: 12 }}
                width={56}
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
                  dot={{ r: 3.5, fill: COLOR_MUJER }}
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
                  dot={{ r: 3.5, fill: COLOR_HOMBRE }}
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
              <h3>Monto ejercido por género</h3>
              <p className="chart-subtitle">
                Importe acumulado en MXN dentro de Oaxaca.
              </p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={265}>
              <BarChart
                data={porGeneroFiltrado}
                margin={{ top: 10, right: 16, left: 4, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#DCE2DF" />
                <XAxis dataKey="genero" tick={{ fill: "#3B4A46", fontSize: 13 }} />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`}
                  tick={{ fill: "#3B4A46", fontSize: 12 }}
                  width={56}
                />
                <Tooltip content={<GeneroTooltip />} />
                <Bar
                  dataKey="monto_mxn"
                  name="Monto ejercido (MXN)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={80}
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
              <h3>Ticket promedio por género</h3>
              <p className="chart-subtitle">
                Monto promedio por crédito otorgado en Oaxaca (MXN).
              </p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={205}>
              <BarChart
                data={porGeneroFiltrado}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 8, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#DCE2DF" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `$${(v / 1e3).toFixed(0)}k`}
                  tick={{ fill: "#3B4A46", fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="genero"
                  tick={{ fill: "#0D2B26", fontSize: 13, fontWeight: 600 }}
                  width={68}
                />
                <Tooltip content={<GeneroTooltip />} />
                <Bar
                  dataKey="ticket_promedio_mxn"
                  name="Ticket promedio (MXN)"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={40}
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
                <span>Peso de Oaxaca respecto al total nacional</span>
                <strong className="tabular-num">{formatPct(oaxacaPct)}</strong>
              </div>
              <div
                className="kpi-progress-track"
                role="progressbar"
                aria-valuenow={shareWidth}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Participación de Oaxaca respecto al total nacional"
              >
                <div
                  className="kpi-progress-fill kpi-progress-fill--emerald"
                  style={{ width: `${shareWidth}%` }}
                />
              </div>
              <p className="national-share-note">
                Calculado sobre el importe nacional del periodo y género seleccionados (incluye App Móvil).
              </p>
            </div>
          )}
        </article>
      </div>

      {porGeneroFiltrado.length > 0 && (
        <article id="tabla-operativa" className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Detalle operativo por género en Oaxaca</h3>
              <p className="chart-subtitle">
                Cifras exactas conciliadas con la base PostgreSQL para auditoría y reporte gerencial.
              </p>
            </div>
          </div>

          <div className="table-scroll" role="region" aria-label="Tabla de métricas por género" tabIndex={0}>
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Género</th>
                  <th scope="col" className="num">Trabajadores</th>
                  <th scope="col" className="num">Créditos</th>
                  <th scope="col" className="num">Monto ejercido (MXN)</th>
                  <th scope="col" className="num">Ticket promedio</th>
                  <th scope="col" className="num">Participación</th>
                </tr>
              </thead>
              <tbody>
                {porGeneroFiltrado.map((row) => {
                  const share =
                    totalCreditosTabla > 0
                      ? ((Number(row.creditos) || 0) / totalCreditosTabla) * 100
                      : 0;
                  return (
                    <tr key={row.genero}>
                      <td>
                        <span className="table-gender-cell">
                          <span
                            className="table-dot"
                            style={{ backgroundColor: getGenderColor(row.genero) }}
                            aria-hidden="true"
                          />
                          <strong>{row.genero}</strong>
                        </span>
                      </td>
                      <td className="num">{formatNum(row.trabajadores)}</td>
                      <td className="num">{formatNum(row.creditos)}</td>
                      <td className="num">{formatMXN(row.monto_mxn, 2)}</td>
                      <td className="num">{formatMXN(row.ticket_promedio_mxn, 2)}</td>
                      <td className="num">{formatPct(share)}</td>
                    </tr>
                  );
                })}
              </tbody>
              {porGeneroFiltrado.length > 1 && (
                <tfoot>
                  <tr>
                    <td><strong>Total Oaxaca</strong></td>
                    <td className="num"><strong>{formatNum(totalCreditosTabla)}</strong></td>
                    <td className="num"><strong>{formatNum(totalCreditosTabla)}</strong></td>
                    <td className="num"><strong>{formatMXN(totalMontoTabla, 2)}</strong></td>
                    <td className="num">
                      <strong>
                        {formatMXN(
                          totalCreditosTabla > 0 ? totalMontoTabla / totalCreditosTabla : 0,
                          2
                        )}
                      </strong>
                    </td>
                    <td className="num"><strong>100.00%</strong></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </article>
      )}
    </section>
  );
}
