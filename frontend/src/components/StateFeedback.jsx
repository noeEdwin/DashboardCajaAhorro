export function LoadingSkeleton() {
  return (
    <div className="state-loading" role="status" aria-live="polite">
      <p className="sr-only">Cargando indicadores y gráficas del dashboard...</p>
      <div className="kpi-grid" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="kpi-card skeleton-card">
            <div className="skeleton-line skeleton-line--sm" />
            <div className="skeleton-line skeleton-line--lg" />
            <div className="skeleton-line skeleton-line--md" />
          </div>
        ))}
      </div>
      <div className="charts-grid" aria-hidden="true">
        <div className="chart-card skeleton-chart" />
        <div className="chart-card skeleton-chart" />
      </div>
    </div>
  );
}

export function ErrorBanner({ message, apiUrl, onRetry, onLoadDemo, isDemoMode }) {
  if (!message) return null;

  return (
    <div className="alert-error" role="alert">
      <div className="alert-error-content">
        <strong>No fue posible obtener los datos desde FastAPI</strong>
        <p>
          {message} ({apiUrl}). Verifica que PostgreSQL y el servidor backend
          estén en ejecución.
        </p>
      </div>
      <div className="alert-error-actions">
        <button type="button" className="btn-primary" onClick={onRetry}>
          Reintentar conexión
        </button>
        {!isDemoMode && (
          <button type="button" className="btn-secondary" onClick={onLoadDemo}>
            Ver vista previa con datos de ejemplo
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ anio, genero, onReset }) {
  return (
    <section className="empty-state" role="status" aria-live="polite">
      <h3>Sin registros para los filtros seleccionados</h3>
      <p>
        No se encontraron créditos ejercidos en Oaxaca para{" "}
        <strong>{anio ? `el año ${anio}` : "todos los años"}</strong> y género{" "}
        <strong>{genero}</strong>.
      </p>
      <button type="button" className="btn-primary" onClick={onReset}>
        Restablecer filtros
      </button>
    </section>
  );
}
