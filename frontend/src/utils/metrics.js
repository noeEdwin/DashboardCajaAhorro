/**
 * Longitud de una barra porcentual: la representación visual debe coincidir
 * con el valor anunciado por el lector de pantalla.
 */
export function percentBarWidth(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 0;
}

const GENDER_ORDER = ["Mujer", "Hombre"];

/**
 * Géneros presentes en la serie de tendencia (filas { periodo, Mujer, Mujer_creditos, ... }).
 * Mujer y Hombre primero; cualquier otro (p. ej. «No especificado») después.
 */
export function trendGenders(tendencia) {
  const found = new Set();
  (tendencia || []).forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (key !== "periodo" && !key.endsWith("_creditos")) found.add(key);
    });
  });
  return [...found].sort((a, b) => {
    const ia = GENDER_ORDER.indexOf(a);
    const ib = GENDER_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });
}

/**
 * Resumen del último periodo de la serie respetando el género seleccionado.
 * Con «Todos» suma todos los géneros presentes, no sólo Mujer y Hombre.
 */
export function lastPeriodSummary(tendencia, genero) {
  if (!tendencia || !tendencia.length) return null;
  const last = tendencia[tendencia.length - 1];
  const genders = genero === "Todos" ? trendGenders([last]) : [genero];
  return {
    periodo: last.periodo,
    monto: genders.reduce((total, key) => total + (Number(last[key]) || 0), 0),
    creditos: genders.reduce((total, key) => total + (Number(last[`${key}_creditos`]) || 0), 0),
  };
}
