"use client";

import { useMemo } from "react";

// =====================================================================
// GLOBAL BACKGROUND — un único fondo continuo para todo el sitio.
//   1. Degradado suave rosado (sin bandas ni cortes entre secciones)
//   2. Capa de polvo dorado/rosado flotando lentamente
//   3. Overlay de grano/noise sutil para textura editorial
// Todo va fixed, detrás del contenido y sin capturar el puntero.
// (La sección Tarot dibuja su propio fondo oscuro por encima de este.)
// =====================================================================

// Grano generado con feTurbulence como data-URI (no requiere assets).
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

interface Dust {
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
  gold: boolean;
}

export default function GlobalBackground() {
  // Posiciones deterministas → evita mismatch de hidratación SSR/cliente.
  const dust = useMemo<Dust[]>(
    () =>
      Array.from({ length: 38 }, (_, i) => {
        const gold = i % 3 === 0;
        return {
          left: (i * 6.7 + (i % 5) * 4) % 100,
          size: 2 + (i % 4) * 1.5,
          duration: 16 + (i % 6) * 4,
          delay: (i % 9) * 2.2,
          drift: (i % 2 === 0 ? 1 : -1) * (16 + (i % 5) * 8),
          opacity: 0.35 + (i % 4) * 0.12,
          gold,
        };
      }),
    [],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Degradado base continuo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #FFF5F7 0%, #FFEEF2 32%, #FDE2E8 66%, #FCD5DD 100%)",
        }}
      />

      {/* Resplandores difusos para dar profundidad sin bandas */}
      <div
        className="absolute -left-40 top-1/4 h-[60vh] w-[60vh] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(212,175,127,0.16), transparent 70%)" }}
      />
      <div
        className="absolute -right-40 top-2/3 h-[55vh] w-[55vh] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(251,199,212,0.22), transparent 70%)" }}
      />

      {/* Polvo flotante */}
      {dust.map((d, i) => (
        <span
          key={i}
          // En móvil mostramos ~la mitad del polvo (menos repintado).
          className={`absolute bottom-0 rounded-full ${
            i >= 20 ? "hidden sm:block" : ""
          }`}
          style={{
            left: `${d.left}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            background: d.gold ? "#D4AF7F" : "#FBC7D4",
            boxShadow: d.gold
              ? "0 0 6px rgba(212,175,127,0.7)"
              : "0 0 5px rgba(232,130,159,0.6)",
            // @ts-expect-error CSS custom properties
            "--drift": `${d.drift}px`,
            "--dust-opacity": d.opacity,
            animation: `dustDrift ${d.duration}s linear ${d.delay}s infinite`,
          }}
        />
      ))}

      {/* Grano / noise */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px", opacity: 0.03 }}
      />
    </div>
  );
}
