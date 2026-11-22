/**
 * Datos demostrativos basados exclusivamente en data/raw/sample_oaxaca_creditos.csv.
 * Se utilizan únicamente si el usuario activa el modo de vista previa cuando
 * el backend FastAPI no está disponible localmente.
 */

const SAMPLE_OAXACA_ROWS = [
  { anio: 2025, mes: 1, periodo: "2025-01", genero: "Mujer", trabajadores: 1120, creditos: 1150, monto_mxn: 24150000 },
  { anio: 2025, mes: 1, periodo: "2025-01", genero: "Hombre", trabajadores: 1340, creditos: 1380, monto_mxn: 31740000 },
  { anio: 2025, mes: 2, periodo: "2025-02", genero: "Mujer", trabajadores: 1185, creditos: 1210, monto_mxn: 25652000 },
  { anio: 2025, mes: 2, periodo: "2025-02", genero: "Hombre", trabajadores: 1390, creditos: 1430, monto_mxn: 33176000 },
  { anio: 2025, mes: 3, periodo: "2025-03", genero: "Mujer", trabajadores: 1250, creditos: 1290, monto_mxn: 27606000 },
  { anio: 2025, mes: 3, periodo: "2025-03", genero: "Hombre", trabajadores: 1420, creditos: 1460, monto_mxn: 34310000 },
  { anio: 2025, mes: 4, periodo: "2025-04", genero: "Mujer", trabajadores: 1290, creditos: 1325, monto_mxn: 28620000 },
  { anio: 2025, mes: 4, periodo: "2025-04", genero: "Hombre", trabajadores: 1455, creditos: 1495, monto_mxn: 35431500 },
  { anio: 2025, mes: 5, periodo: "2025-05", genero: "Mujer", trabajadores: 1360, creditos: 1400, monto_mxn: 30520000 },
  { anio: 2025, mes: 5, periodo: "2025-05", genero: "Hombre", trabajadores: 1510, creditos: 1550, monto_mxn: 37045000 },
  { anio: 2025, mes: 6, periodo: "2025-06", genero: "Mujer", trabajadores: 1410, creditos: 1450, monto_mxn: 31900000 },
  { anio: 2025, mes: 6, periodo: "2025-06", genero: "Hombre", trabajadores: 1540, creditos: 1585, monto_mxn: 38198500 },
  { anio: 2026, mes: 1, periodo: "2026-01", genero: "Mujer", trabajadores: 1310, creditos: 1350, monto_mxn: 29970000 },
  { anio: 2026, mes: 1, periodo: "2026-01", genero: "Hombre", trabajadores: 1480, creditos: 1525, monto_mxn: 36752500 },
  { anio: 2026, mes: 2, periodo: "2026-02", genero: "Mujer", trabajadores: 1380, creditos: 1420, monto_mxn: 31808000 },
  { anio: 2026, mes: 2, periodo: "2026-02", genero: "Hombre", trabajadores: 1520, creditos: 1565, monto_mxn: 38029500 },
  { anio: 2026, mes: 3, periodo: "2026-03", genero: "Mujer", trabajadores: 1450, creditos: 1495, monto_mxn: 33787000 },
  { anio: 2026, mes: 3, periodo: "2026-03", genero: "Hombre", trabajadores: 1580, creditos: 1625, monto_mxn: 39812500 },
];

const SAMPLE_NACIONAL_POR_ANIO = {
  2025: 1788000000 + 2392000000 + 1863400000 + 2468040000 + 1942240000 + 2555520000,
  2026: 2061480000 + 2638720000 + 2142720000 + 2714840000 + 2225000000 + 2808000000,
};

export const SAMPLE_FILTROS = {
  anios: [2026, 2025],
  generos: ["Hombre", "Mujer"],
};

export function getSampleDashboardData(anio, genero) {
  const anioNum = anio ? Number(anio) : null;
  const generoFilter = genero && genero !== "Todos" ? genero : null;

  const filtered = SAMPLE_OAXACA_ROWS.filter((row) => {
    if (anioNum && row.anio !== anioNum) return false;
    if (generoFilter && row.genero.toLowerCase() !== generoFilter.toLowerCase()) return false;
    return true;
  });

  const total_trabajadores = filtered.reduce((acc, r) => acc + r.trabajadores, 0);
  const total_creditos = filtered.reduce((acc, r) => acc + r.creditos, 0);
  const monto_total_mxn = filtered.reduce((acc, r) => acc + r.monto_mxn, 0);
  const ticket_promedio_mxn = total_creditos > 0 ? Number((monto_total_mxn / total_creditos).toFixed(2)) : 0;

  const mujerRows = filtered.filter((r) => r.genero === "Mujer");
  const hombreRows = filtered.filter((r) => r.genero === "Hombre");
  const mujerCred = mujerRows.reduce((acc, r) => acc + r.creditos, 0);
  const hombreCred = hombreRows.reduce((acc, r) => acc + r.creditos, 0);
  const mujerMonto = mujerRows.reduce((acc, r) => acc + r.monto_mxn, 0);
  const hombreMonto = hombreRows.reduce((acc, r) => acc + r.monto_mxn, 0);

  const participacion_mujeres_pct = total_creditos > 0 ? Number(((mujerCred / total_creditos) * 100).toFixed(2)) : 0;
  const participacion_hombres_pct = total_creditos > 0 ? Number(((hombreCred / total_creditos) * 100).toFixed(2)) : 0;

  const ticketMujer = mujerCred > 0 ? mujerMonto / mujerCred : 0;
  const ticketHombre = hombreCred > 0 ? hombreMonto / hombreCred : 0;
  const brecha_ticket_genero_mxn = Number((ticketHombre - ticketMujer).toFixed(2));

  const monto2025 = SAMPLE_OAXACA_ROWS.filter((r) => r.anio === 2025).reduce((a, r) => a + r.monto_mxn, 0);
  const monto2026 = SAMPLE_OAXACA_ROWS.filter((r) => r.anio === 2026).reduce((a, r) => a + r.monto_mxn, 0);
  const crecimiento_periodo_pct = monto2025 > 0 ? Number((((monto2026 - monto2025) / monto2025) * 100).toFixed(2)) : 0;

  const montoNacional = anioNum
    ? SAMPLE_NACIONAL_POR_ANIO[anioNum] || 0
    : SAMPLE_NACIONAL_POR_ANIO[2025] + SAMPLE_NACIONAL_POR_ANIO[2026];
  const participacion_oaxaca_nacional_pct =
    montoNacional > 0 ? Number(((monto_total_mxn / montoNacional) * 100).toFixed(2)) : 0;

  const byGenderMap = {};
  SAMPLE_OAXACA_ROWS.filter((r) => !anioNum || r.anio === anioNum).forEach((r) => {
    if (!byGenderMap[r.genero]) {
      byGenderMap[r.genero] = { genero: r.genero, trabajadores: 0, creditos: 0, monto_mxn: 0 };
    }
    byGenderMap[r.genero].trabajadores += r.trabajadores;
    byGenderMap[r.genero].creditos += r.creditos;
    byGenderMap[r.genero].monto_mxn += r.monto_mxn;
  });

  const porGenero = Object.values(byGenderMap)
    .sort((a, b) => a.genero.localeCompare(b.genero))
    .map((g) => ({
      ...g,
      ticket_promedio_mxn: g.creditos > 0 ? Number((g.monto_mxn / g.creditos).toFixed(2)) : 0,
    }));

  return {
    kpis: {
      total_trabajadores,
      total_creditos,
      monto_total_mxn: Number(monto_total_mxn.toFixed(2)),
      ticket_promedio_mxn,
      participacion_mujeres_pct,
      participacion_hombres_pct,
      brecha_ticket_genero_mxn,
      crecimiento_periodo_pct,
      participacion_oaxaca_nacional_pct,
    },
    porGenero,
    tendenciaRows: filtered,
  };
}
