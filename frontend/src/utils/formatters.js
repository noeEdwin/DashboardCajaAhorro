const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

/**
 * Formatea una cantidad numérica en pesos mexicanos (MXN).
 */
export function formatMXN(value, decimals = 0) {
  const num = Number(value);
  const safe = Number.isFinite(num) ? num : 0;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safe);
}

/**
 * Formatea un número entero o decimal con separadores de miles (es-MX).
 */
export function formatNum(value) {
  const num = Number(value);
  const safe = Number.isFinite(num) ? num : 0;
  return new Intl.NumberFormat("es-MX").format(safe);
}

/**
 * Formatea un porcentaje con símbolo % y decimales controlados.
 */
export function formatPct(value, decimals = 2) {
  const num = Number(value);
  const safe = Number.isFinite(num) ? num : 0;
  return `${new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safe)}%`;
}

/**
 * Convierte un periodo YYYY-MM a etiqueta legible (ej. "2026-03" -> "Mar 2026").
 */
export function formatPeriodo(periodo) {
  if (!periodo || typeof periodo !== "string") return "";
  const [year, monthStr] = periodo.split("-");
  const monthIdx = Number(monthStr) - 1;
  if (monthIdx >= 0 && monthIdx < 12 && year) {
    return `${MESES_CORTOS[monthIdx]} ${year}`;
  }
  return periodo;
}
