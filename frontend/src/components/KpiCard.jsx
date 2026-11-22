import { percentBarWidth } from "../utils/metrics";

export default function KpiCard({
  title,
  value,
  subtitle,
  badgeText,
  badgeTone = "neutral",
  progressPct,
  progressLabel,
  featured = false,
  splitBar = false,
}) {
  const clampedPct =
    typeof progressPct === "number" ? percentBarWidth(progressPct) : null;

  return (
    <article className={`kpi-card ${featured ? "kpi-card--featured" : ""}`}>
      <div className="kpi-header">
        <span className="kpi-label">{title}</span>
        {badgeText && (
          <span className={`kpi-badge kpi-badge--${badgeTone}`}>
            {badgeText}
          </span>
        )}
      </div>

      <strong className={`kpi-value ${featured ? "kpi-value--featured" : ""}`}>
        {value}
      </strong>

      {clampedPct !== null && (
        <div
          className={`kpi-progress-track ${splitBar ? "kpi-progress-track--split" : ""}`}
          role="progressbar"
          aria-valuenow={Math.round(clampedPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={progressLabel || title}
        >
          <div
            className="kpi-progress-fill"
            style={{ width: `${clampedPct}%` }}
          />
        </div>
      )}

      <span className="kpi-sub">{subtitle}</span>
    </article>
  );
}
