import { useState } from "react";

const NAV_ITEMS = [
  { id: "resumen", label: "Resumen Ejecutivo (8 KPIs)" },
  { id: "tendencia", label: "Tendencia Mensual" },
  { id: "genero", label: "Desglose por Género" },
  { id: "brecha-ticket", label: "Ticket y Participación" },
];

export default function Sidebar({ activeSection, onSelectSection, isDemoMode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (id) => {
    setMobileOpen(false);
    if (onSelectSection) onSelectSection(id);
  };

  return (
    <aside className="sidebar" aria-label="Navegación principal">
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-badge" aria-hidden="true">
            HC
          </div>
          <div>
            <h1 className="brand-title">Horizonte</h1>
            <span className="brand-subtitle">COOPERATIVO · OAXACA</span>
          </div>
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={mobileOpen}
          aria-controls="sidebar-nav"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? "Cerrar menú" : "Menú"}
        </button>
      </div>

      <nav
        id="sidebar-nav"
        className={`sidebar-nav ${mobileOpen ? "is-open" : ""}`}
        aria-label="Secciones del dashboard"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={isActive ? "active" : ""}
              aria-current={isActive ? "location" : undefined}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className={`sidebar-footer ${mobileOpen ? "is-open" : ""}`}>
        {isDemoMode && (
          <div className="demo-pill" role="status">
            Vista de ejemplo (CSV)
          </div>
        )}
        <p className="footer-meta">Fuente: datos.gob.mx (FONACOT)</p>
        <p className="footer-meta">Equipo Omadas · ITO TecNM</p>
      </div>
    </aside>
  );
}
