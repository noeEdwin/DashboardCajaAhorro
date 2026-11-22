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
import { percentBarWidth, trendGenders } from "../utils/metrics";
import useReducedMotion from "../utils/useReducedMotion";
import ChartDataTable from "./ChartDataTable";

const COLOR_MUJER = "#A21C58";
const COLOR_HOMBRE = "#1D4E89";
const COLOR_OTRO = "#0B6E5C";

function getGenderColor(genero) {
  const g = String(genero).toLowerCase();
  if (g === "mujer") return COLOR_MUJER;
  if (g === "hombre") return COLOR_HOMBRE;
  return COLOR_OTRO;
}

function getGenderDash(genero) {
  const g = String(genero).toLowerCase();
  if (g === "hombre") return "6 3";
  if (g === "mujer") return undefined;
  return "2 3";
}

function getGenderLegend(genero) {
  const g = String(genero).toLowerCase();
  if (g === "mujer") return "continua";
  if (g === "hombre") return "discontinua";
  return "punteada";
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
  const reducedMotion = useReducedMotion();
  const animate = !reducedMotion;
  const seriesGeneros = trendGenders(tendencia);

  const porGeneroFiltrado =
    generoSeleccionado === "Todos"
      ? porGenero
      : porGenero.filter(
          (item) => item.genero.toLowerCase() === generoSeleccionado.toLowerCase()
        );

  const totalTrabajadoresTabla = porGeneroFiltrado.reduce(
    (acc, item) => acc + (Number(item.trabajadores) || 0),
    0
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
            {seriesGeneros.map((gender) => (
              <span
                key={gender}
                className={`legend-pill ${
                  gender === "Mujer"
                    ? "legend-pill--mujer"
                    : gender === "Hombre"
                    ? "legend-pill--hombre"
                    : "legend-pill--otro"
                }`}
              >
                <span className="legend-swatch" aria-hidden="true" /> {gender} ({getGenderLegend(gender)})
              </span>
            ))}
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
              {seriesGeneros.map((gender) => (
                <Line
                  key={gender}
                  type="monotone"
                  dataKey={gender}
                  name={`${gender} (MXN)`}
                  stroke={getGenderColor(gender)}
                  strokeWidth={2.75}
                  strokeDasharray={getGenderDash(gender)}
                  dot={{ r: 3.5, fill: getGenderColor(gender) }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={animate}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <ChartDataTable
          title="Datos de la tendencia mensual de colocación en Oaxaca"
          columns={[
            "Periodo",
            ...seriesGeneros.flatMap((gender) => [
              `${gender} (MXN)`,
              `Créditos ${gender.toLowerCase()}`,
            ]),
          ]}
          rows={tendencia.map((row) => [
            formatPeriodo(row.periodo),
            ...seriesGeneros.flatMap((gender) => [
              row[gender] == null ? "—" : formatMXN(row[gender], 2),
              row[`${gender}_creditos`] == null ? "—" : formatNum(row[`${gender}_creditos`]),
            ]),
          ])}
        />
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
                  isAnimationActive={animate}
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

          <ChartDataTable
            title="Datos de monto ejercido por género en Oaxaca"
            columns={["Género", "Monto ejercido (MXN)", "Créditos", "Trabajadores"]}
            rows={porGeneroFiltrado.map((row) => [
              row.genero,
              formatMXN(row.monto_mxn, 2),
              formatNum(row.creditos),
              formatNum(row.trabajadores),
            ])}
          />
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
                  isAnimationActive={animate}
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

          <ChartDataTable
            title="Datos de ticket promedio por género en Oaxaca"
            columns={["Género", "Ticket promedio (MXN)", "Créditos"]}
            rows={porGeneroFiltrado.map((row) => [
              row.genero,
              formatMXN(row.ticket_promedio_mxn, 2),
              formatNum(row.creditos),
            ])}
          />

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
                    <td className="num"><strong>{formatNum(totalTrabajadoresTabla)}</strong></td>
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
