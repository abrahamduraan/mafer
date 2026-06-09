"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Fireworks from "./Fireworks";
import { Flourish, GeminiGlyph } from "./SVGIcons";

// =====================================================================
// HERO — bienvenida editorial.
// Título serif italic revelado letra por letra, subtítulo con flourishes
// ornamentales, mención sutil a Géminis y fuegos artificiales reales al
// cargar. Los globos son SVG con volumen; el fondo es el global.
// =====================================================================

const TITLE = "Feliz Cumpleaños, Mafer";

// Máximo 5 globos · paleta refinada (rose-200, champagne, gold-soft)
const BALLOONS = [
  { color: "#FBC7D4", highlight: "#FFE3EA", left: 8, size: 92, delay: 0, dur: 7 },
  { color: "#F5E6D3", highlight: "#FFF6EA", left: 22, size: 74, delay: 1.2, dur: 8.5 },
  { color: "#D4AF7F", highlight: "#EBD3AE", left: 74, size: 80, delay: 0.6, dur: 7.8 },
  { color: "#FBC7D4", highlight: "#FFE3EA", left: 88, size: 70, delay: 1.8, dur: 9 },
  { color: "#F5E6D3", highlight: "#FFF6EA", left: 60, size: 64, delay: 2.4, dur: 8 },
];

export default function Hero() {
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowFireworks(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Fuegos artificiales reales (8.5s y luego se calman) */}
      <Fireworks trigger={showFireworks} duration={8500} />

      {/* Globos SVG con volumen, flotando suavemente */}
      {BALLOONS.map((b, i) => (
        <Balloon key={i} {...b} />
      ))}

      {/* Contenido central */}
      <div className="relative z-10 flex flex-col items-center">
        <h1
          className="font-display text-5xl italic text-rose-900 tracking-editorial sm:text-7xl"
          aria-label={TITLE}
        >
          {TITLE.split("").map((ch, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="inline-block"
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: "easeOut" }}
            >
              {ch === " " ? " " : ch}
            </motion.span>
          ))}
        </h1>

        {/* Subtítulo con flourishes ornamentales arriba y abajo */}
        <motion.div
          className="mt-8 flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
        >
          <Flourish width={150} className="text-gold-soft/70" />
          <p className="font-body text-xl font-light tracking-wide text-rose-600 sm:text-2xl">
            Veintisiete años de ser única
          </p>
          <Flourish width={150} className="rotate-180 text-gold-soft/70" />
        </motion.div>

        {/* Mención sutil a Géminis */}
        <motion.div
          className="mt-6 flex items-center gap-3 text-sm font-light tracking-[0.2em] text-rose-400 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
        >
          <span>Veintisiete años</span>
          <span className="text-gold-soft/60">·</span>
          <span>10 de junio</span>
          <span className="text-gold-soft/60">·</span>
          <span className="flex items-center gap-1.5">
            <GeminiGlyph size={15} className="text-gold-soft" />
            Géminis
          </span>
        </motion.div>
      </div>

      {/* Indicador de scroll */}
      <motion.div
        className="absolute bottom-10 z-10 flex flex-col items-center text-rose-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 1 }}
      >
        <span className="mb-2 text-xs font-light tracking-[0.25em] uppercase">
          Desliza para celebrar
        </span>
        <svg
          className="animate-bounce-soft"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </motion.div>
    </section>
  );
}

// --- Globo SVG con volumen (highlight, sombra interna, hilo curvo) ---
function Balloon({
  color,
  highlight,
  left,
  size,
  delay,
  dur,
}: {
  color: string;
  highlight: string;
  left: number;
  size: number;
  delay: number;
  dur: number;
}) {
  const gid = `balloon-${left}-${size}`;
  return (
    <motion.div
      className="pointer-events-none absolute z-0"
      style={{ left: `${left}%`, top: `${12 + (size % 7) * 2}%`, width: size }}
      initial={{ y: 0, rotate: -2 }}
      animate={{ y: [0, -18, 0], rotate: [-2, 2, -2] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width={size} height={size * 1.5} viewBox="0 0 100 150" fill="none">
        <defs>
          <radialGradient id={gid} cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor={highlight} />
            <stop offset="55%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.92" />
          </radialGradient>
        </defs>
        {/* cuerpo */}
        <path
          d="M50 6C72 6 86 24 86 48c0 24-16 40-36 52C30 88 14 72 14 48 14 24 28 6 50 6Z"
          fill={`url(#${gid})`}
        />
        {/* sombra interna inferior para dar volumen */}
        <path
          d="M50 100c14-10 26-26 26-46"
          stroke="#00000018"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        {/* highlight especular */}
        <ellipse cx="36" cy="32" rx="8" ry="13" fill="#FFFFFF" opacity="0.55" />
        {/* nudo */}
        <path d="M50 100l-5 8h10Z" fill={color} />
        {/* hilo curvo */}
        <path
          d="M50 108c0 8 6 12 2 20s2 12 2 18"
          stroke="#C99BAE"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
    </motion.div>
  );
}
