import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Indica si el usuario pidió reducir el movimiento en su sistema operativo.
 * La regla CSS de App.css no alcanza a Recharts porque anima con JavaScript,
 * así que las gráficas consultan este valor para desactivar su animación.
 */
export default function useReducedMotion() {
  const getMatch = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(QUERY).matches
      : false;

  const [reduced, setReduced] = useState(getMatch);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    const media = window.matchMedia(QUERY);
    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
