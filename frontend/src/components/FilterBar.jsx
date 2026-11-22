export default function FilterBar({
  anio,
  genero,
  filtros,
  loading,
  isDemoMode,
  onAnioChange,
  onGeneroChange,
  onResetFilters,
}) {
  const hasActiveFilters = Boolean(anio) || genero !== "Todos";

  return (
    <header className="topbar">
      <div className="topbar-title-group">
        <div className="topbar-context">
          <span className="context-tag">Oaxaca, ejercicio 2025</span>
          {isDemoMode && (
            <span className="badge badge-warning">
              Datos de ejemplo sin conexión a API
            </span>
          )}
        </div>
        <h2>Créditos ejercidos por género en Oaxaca</h2>
        <p className="subtitle">
          Seguimiento gerencial de colocación, ticket promedio, brecha de género y peso frente al total nacional.
        </p>
      </div>

      <form
        className="filters"
        role="search"
        aria-label="Filtros de periodo y género"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="filter-field">
          <label htmlFor="filter-anio">Año</label>
          <select
            id="filter-anio"
            value={anio}
            onChange={(e) => onAnioChange(e.target.value)}
            disabled={loading && filtros.anios.length === 0}
          >
            <option value="">Todos los años</option>
            {filtros.anios.map((a) => (
              <option key={a} value={String(a)}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label htmlFor="filter-genero">Género</label>
          <select
            id="filter-genero"
            value={genero}
            onChange={(e) => onGeneroChange(e.target.value)}
            disabled={loading && filtros.generos.length === 0}
          >
            <option value="Todos">Todos</option>
            {filtros.generos.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn-secondary btn-reset"
            onClick={onResetFilters}
            aria-label="Restablecer filtros de año y género"
          >
            Limpiar filtros
          </button>
        )}

        <div className="filter-status" aria-live="polite">
          {loading && <span className="loading-pill">Actualizando...</span>}
        </div>
      </form>
    </header>
  );
}
