export default function KpiCard({
  index,
  title,
  value,
  subtitle,
  badgeText,
  badgeTone = "neutral",
  progressPct,
  progressLabel,
}) {
  const clampedPct =
    typeof progressPct === "number"
      ? Math.max(0, Math.min(100, progressPct))
      : null;

  return (
    <article className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-label">
          <span className="kpi-index" aria-hidden="true">
            {index}.
          </span>{" "}
          {title}
        </span>
        {badgeText && (
          <span className={`kpi-badge kpi-badge--${badgeTone}`}>
            {badgeText}
          </span>
        )}
      </div>

      <strong className="kpi-value">{value}</strong>

      {clampedPct !== null && (
        <div
          className="kpi-progress-track"
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
