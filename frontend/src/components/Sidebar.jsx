import { useState } from "react";

const NAV_ITEMS = [
  {
    id: "resumen",
    label: "Resumen ejecutivo",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="11.5" y="2.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="2.5" y="11.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: "tendencia",
    label: "Tendencia mensual",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 14.5L7.5 10L11 12.5L17 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.5 6H17V9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "genero",
    label: "Desglose por género",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3" y="10" width="3.5" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <rect x="8.25" y="5" width="3.5" height="12" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13.5" y="7.5" width="3.5" height="9.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: "brecha-ticket",
    label: "Ticket y participación",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 3V10H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "tabla-operativa",
    label: "Detalle por género",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2.5 8H17.5M8 8V16.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
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
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0B6E5C" />
              <path
                d="M7 21L13 13L18 17.5L25 10"
                stroke="#F7F8F6"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="25" cy="10" r="2.2" fill="#F0B429" />
            </svg>
          </div>
          <div>
            <h1 className="brand-title">Horizonte Cooperativo</h1>
            <span className="brand-subtitle">Caja de ahorro en Oaxaca</span>
          </div>
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={mobileOpen}
          aria-controls="sidebar-nav"
          aria-label={mobileOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            {mobileOpen ? (
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path d="M3 5.5H17M3 10H17M3 14.5H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
          <span>{mobileOpen ? "Cerrar" : "Menú"}</span>
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
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className={`sidebar-footer ${mobileOpen ? "is-open" : ""}`}>
        {isDemoMode ? (
          <div className="status-pill status-pill--demo" role="status">
            Vista previa con datos de ejemplo
          </div>
        ) : (
          <div className="status-pill status-pill--live" role="status">
            <span className="live-dot" aria-hidden="true" />
            Datos oficiales FONACOT 2025
          </div>
        )}
        <p className="footer-meta">Fuente: datos.gob.mx</p>
        <p className="footer-meta">Equipo Omadas, ITO TecNM</p>
      </div>
    </aside>
  );
}
