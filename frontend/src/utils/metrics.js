/**
 * Longitud de una barra porcentual: la representación visual debe coincidir
 * con el valor anunciado por el lector de pantalla.
 */
export function percentBarWidth(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 0;
}
