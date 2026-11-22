import test from "node:test";
import assert from "node:assert/strict";
import {
  formatMXN,
  formatNum,
  formatPct,
  formatPeriodo,
} from "./formatters.js";
import { getSampleDashboardData } from "../data/sampleDemoData.js";
import { percentBarWidth } from "./metrics.js";

test("formatMXN formats currency in es-MX without NaN", () => {
  const out = formatMXN(24150000);
  assert.match(out, /24,150,000/);
  assert.ok(out.includes("$"));
  assert.equal(formatMXN(undefined), "$0");
});

test("formatNum and formatPct format numbers and percentages cleanly", () => {
  assert.equal(formatNum(12345), "12,345");
  assert.equal(formatPct(12.345, 2), "12.35%");
  assert.equal(formatPeriodo("2026-03"), "Mar 2026");
});

test("getSampleDashboardData computes all KPIs and applies anio and genero filters", () => {
  const all = getSampleDashboardData("", "Todos");
  assert.ok(all.kpis.total_creditos > 0);
  assert.ok(all.kpis.monto_total_mxn > 0);
  assert.ok(all.kpis.ticket_promedio_mxn > 0);
  assert.equal(
    Number(
      (
        all.kpis.participacion_mujeres_pct +
        all.kpis.participacion_hombres_pct
      ).toFixed(1)
    ),
    100
  );
  assert.equal(all.porGenero.length, 2);

  const only2026Mujer = getSampleDashboardData("2026", "Mujer");
  assert.equal(only2026Mujer.kpis.participacion_mujeres_pct, 100);
  assert.equal(only2026Mujer.kpis.participacion_hombres_pct, 0);
  assert.ok(
    only2026Mujer.tendenciaRows.every(
      (r) => r.anio === 2026 && r.genero === "Mujer"
    )
  );
});

test("la barra nacional representa exactamente el porcentaje indicado", () => {
  const porcentaje = getSampleDashboardData("2025", "Todos").kpis.participacion_oaxaca_nacional_pct;
  assert.equal(percentBarWidth(porcentaje), porcentaje);
  assert.equal(percentBarWidth(-5), 0);
  assert.equal(percentBarWidth(125), 100);
  assert.equal(percentBarWidth(undefined), 0);
});
