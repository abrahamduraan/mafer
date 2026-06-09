"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Lock, Wind } from "lucide-react";
import { useAuth } from "./AuthProvider";
import Fireworks from "./Fireworks";
import { Flourish } from "./SVGIcons";

// =====================================================================
// CAKE — pastel realista de 3 pisos con volumen (gradientes radiales),
// goteo de glaseado, perlas doradas, rositas y velas que se encienden
// (y se apagan) una por una. Solo Mafer puede soplar las velas.
// =====================================================================

const CANDLE_X = [128, 149, 170, 191, 212];
const CANDLE_COLORS = ["#FBC7D4", "#F5E6D3", "#FBC7D4", "#F5E6D3", "#FBC7D4"];

export default function Cake() {
  const { isMafer, openLogin } = useAuth();
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-120px" });

  // Velas encendidas (se prenden en secuencia al entrar en viewport)
  const [lit, setLit] = useState<boolean[]>([false, false, false, false, false]);
  // Velas apagadas (se apagan en secuencia al soplar)
  const [out, setOut] = useState<boolean[]>([false, false, false, false, false]);
  const [blowing, setBlowing] = useState(false);
  const [wished, setWished] = useState(false);
  const [count, setCount] = useState(0);

  // Encender velas una por una
  useEffect(() => {
    if (!inView) return;
    const timers = CANDLE_X.map((_, i) =>
      setTimeout(() => {
        setLit((prev) => prev.map((v, idx) => (idx === i ? true : v)));
      }, 700 + i * 200),
    );
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  // Contador elegante 0 → 27
  useEffect(() => {
    if (!inView) return;
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setCount(n);
      if (n >= 27) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, [inView]);

  const handleBlow = () => {
    if (!isMafer || blowing) return;
    setBlowing(true);

    // Apagar velas una por una
    CANDLE_X.forEach((_, i) => {
      setTimeout(() => {
        setOut((prev) => prev.map((v, idx) => (idx === i ? true : v)));
      }, 400 + i * 280);
    });

    // Tras apagarse la última: deseo + fuegos artificiales
    setTimeout(() => setWished(true), 400 + CANDLE_X.length * 280 + 300);
  };

  const allOut = out.every(Boolean);

  return (
    <section
      ref={sectionRef}
      className="relative flex w-full flex-col items-center justify-center px-4 py-24"
    >
      {/* Fuegos artificiales al completar el soplido */}
      <Fireworks trigger={wished} duration={7000} />

      {/* Encabezado */}
      <motion.p
        className="font-display text-3xl italic text-rose-600 sm:text-4xl"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Pide un deseo
      </motion.p>
      <Flourish width={130} className="mt-3 text-gold-soft/70" />

      {/* Contador script elegante */}
      <motion.div
        className="font-script shimmer-gold mt-4 text-7xl leading-none sm:text-8xl"
        initial={{ opacity: 0, scale: 0.7 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 140, damping: 16 }}
      >
        {count}
      </motion.div>

      {/* --- Pastel --- */}
      <motion.div
        className="relative my-8"
        initial={{ opacity: 0, y: 80, scale: 0.85 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 90, damping: 16 }}
      >
        <CakeSVG lit={lit} out={out} blowing={blowing} />

        {/* Líneas de viento al soplar */}
        <AnimatePresence>
          {blowing && !allOut && <WindLines />}
        </AnimatePresence>
      </motion.div>

      {/* --- Mensaje del deseo --- */}
      <AnimatePresence>
        {wished && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-6 font-display text-2xl italic text-rose-600"
          >
            Tu deseo está en camino
          </motion.p>
        )}
      </AnimatePresence>

      {/* --- Botón --- */}
      {!isMafer ? (
        <button
          onClick={openLogin}
          className="flex items-center gap-2 rounded-full border border-rose-400 bg-transparent px-7 py-3 font-body text-base font-light tracking-wide text-rose-600 transition-colors duration-300 hover:bg-rose-100"
        >
          <Lock size={17} strokeWidth={1.5} />
          Solo Mafer puede soplar las velas
        </button>
      ) : (
        !blowing && (
          <button
            onClick={handleBlow}
            className="flex items-center gap-2 rounded-full border border-rose-400 bg-transparent px-8 py-3 font-body text-base font-light tracking-wide text-rose-600 transition-colors duration-300 hover:bg-rose-100"
          >
            <Wind size={17} strokeWidth={1.5} />
            Soplar las velas
          </button>
        )
      )}
    </section>
  );
}

// ====================== PASTEL SVG ======================
function CakeSVG({
  lit,
  out,
  blowing,
}: {
  lit: boolean[];
  out: boolean[];
  blowing: boolean;
}) {
  return (
    <svg
      width="340"
      height="420"
      viewBox="0 0 340 420"
      className="drop-shadow-[0_22px_36px_rgba(192,72,112,0.25)]"
    >
      <defs>
        {/* Gradientes radiales para volumen en cada piso */}
        <radialGradient id="tier1" cx="42%" cy="28%" r="85%">
          <stop offset="0%" stopColor="#FFE3EA" />
          <stop offset="60%" stopColor="#FBC7D4" />
          <stop offset="100%" stopColor="#E8829F" />
        </radialGradient>
        <radialGradient id="tier2" cx="42%" cy="28%" r="85%">
          <stop offset="0%" stopColor="#FFF1F4" />
          <stop offset="60%" stopColor="#FDD7DF" />
          <stop offset="100%" stopColor="#E89BB1" />
        </radialGradient>
        <radialGradient id="tier3" cx="42%" cy="28%" r="85%">
          <stop offset="0%" stopColor="#FFF6F8" />
          <stop offset="65%" stopColor="#FDE2E8" />
          <stop offset="100%" stopColor="#F0AFC0" />
        </radialGradient>
        <linearGradient id="glaze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFF0F4" />
        </linearGradient>
        <linearGradient id="plate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7EAD7" />
          <stop offset="100%" stopColor="#E7CFA8" />
        </linearGradient>
        <radialGradient id="flameG" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFF7D6" />
          <stop offset="45%" stopColor="#FFD27A" />
          <stop offset="100%" stopColor="#F2994A" />
        </radialGradient>
      </defs>

      {/* ===== PLATO con borde dorado ===== */}
      <ellipse cx="170" cy="392" rx="155" ry="20" fill="url(#plate)" />
      <ellipse cx="170" cy="388" rx="155" ry="20" fill="none" stroke="#D4AF7F" strokeWidth="2" />
      <ellipse cx="170" cy="386" rx="120" ry="13" fill="#FFFDF8" opacity="0.5" />

      {/* ===== PISO 1 (base) ===== */}
      <Tier x={60} y={296} w={220} h={78} rx={16} fill="url(#tier1)" />
      <Drip y={300} from={62} to={278} fill="url(#glaze)" big />
      <GoldThread y={350} from={74} to={266} />
      <Pearls y={304} from={78} to={262} step={23} />

      {/* ===== PISO 2 (medio) ===== */}
      <Tier x={88} y={224} w={164} h={74} rx={14} fill="url(#tier2)" />
      <Drip y={228} from={90} to={250} fill="url(#glaze)" />
      <Pearls y={232} from={100} to={240} step={20} />
      <Rose x={118} y={266} />
      <Rose x={222} y={266} />

      {/* ===== PISO 3 (top) ===== */}
      <Tier x={114} y={162} w={112} h={64} rx={12} fill="url(#tier3)" />
      <Drip y={166} from={116} to={224} fill="url(#glaze)" small />
      <Pearls y={170} from={126} to={214} step={18} />

      {/* "27" en script dorado sobre el piso superior */}
      <text
        x="170"
        y="208"
        textAnchor="middle"
        fontSize="34"
        fill="#C04870"
        style={{ fontFamily: "var(--font-script), cursive", fontWeight: 700 }}
      >
        27
      </text>

      {/* ===== VELAS ===== */}
      {CANDLE_X.map((x, i) => (
        <Candle
          key={i}
          x={x}
          color={CANDLE_COLORS[i]}
          lit={lit[i]}
          out={out[i]}
          blowing={blowing}
          delay={i * 0.12}
        />
      ))}
    </svg>
  );
}

// --- Piso con leve sombreado lateral para reforzar el volumen ---
function Tier({
  x,
  y,
  w,
  h,
  rx,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
  fill: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} />
      {/* highlight superior */}
      <rect x={x + 6} y={y + 4} width={w - 12} height={10} rx={6} fill="#FFFFFF" opacity="0.18" />
      {/* sombra lateral derecha */}
      <rect x={x + w - 18} y={y + 8} width={14} height={h - 16} rx={7} fill="#00000012" />
    </g>
  );
}

// --- Goteo de glaseado en el borde superior ---
function Drip({
  y,
  from,
  to,
  fill,
  big,
  small,
}: {
  y: number;
  from: number;
  to: number;
  fill: string;
  big?: boolean;
  small?: boolean;
}) {
  const span = to - from;
  const dripCount = small ? 5 : big ? 8 : 6;
  const drops = Array.from({ length: dripCount }, (_, i) => {
    const cx = from + ((i + 0.5) * span) / dripCount;
    const len = 10 + ((i * 7) % 16);
    return { cx, len };
  });
  return (
    <g>
      {/* cobertura superior */}
      <rect x={from} y={y - 8} width={span} height={16} rx={8} fill={fill} />
      {drops.map((d, i) => (
        <path
          key={i}
          d={`M${d.cx - 7} ${y} q7 ${d.len + 6} 7 ${d.len} q0 5 -7 5 q-7 0 -7 -5 q0 -${d.len - 6} 7 -${d.len}Z`}
          fill={fill}
        />
      ))}
    </g>
  );
}

// --- Perlas doradas a lo largo de la costura ---
function Pearls({
  y,
  from,
  to,
  step,
}: {
  y: number;
  from: number;
  to: number;
  step: number;
}) {
  const dots: number[] = [];
  for (let x = from; x <= to; x += step) dots.push(x);
  return (
    <g>
      {dots.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3.2" fill="#D4AF7F" />
          <circle cx={x - 1} cy={y - 1} r="1.1" fill="#FFF6E6" opacity="0.9" />
        </g>
      ))}
    </g>
  );
}

// --- Hilo dorado (swag) ---
function GoldThread({ y, from, to }: { y: number; from: number; to: number }) {
  const mid = (from + to) / 2;
  return (
    <path
      d={`M${from} ${y} Q${(from + mid) / 2} ${y + 16} ${mid} ${y + 4} T${to} ${y}`}
      fill="none"
      stroke="#D4AF7F"
      strokeWidth="1.4"
      opacity="0.85"
    />
  );
}

// --- Rosita SVG detallada (pétalos en espiral) ---
function Rose({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {/* pétalos externos */}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <path
          key={deg}
          d="M0 0 C5 -8 11 -8 11 0 C11 7 4 9 0 5Z"
          fill="#F4A6BC"
          transform={`rotate(${deg})`}
          opacity="0.95"
        />
      ))}
      {/* pétalos internos */}
      {[30, 150, 270].map((deg) => (
        <path
          key={deg}
          d="M0 0 C3 -5 7 -5 7 0 C7 4 2 6 0 3Z"
          fill="#E8829F"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle r="2.4" fill="#C04870" />
      {/* hojita */}
      <path d="M9 6 q8 2 11 9 q-9 1 -12 -7Z" fill="#BBD9B0" opacity="0.85" />
    </g>
  );
}

// --- Vela individual con llama (morph) o humo ---
function Candle({
  x,
  color,
  lit,
  out,
  blowing,
  delay,
}: {
  x: number;
  color: string;
  lit: boolean;
  out: boolean;
  blowing: boolean;
  delay: number;
}) {
  const showFlame = lit && !out;
  return (
    <g>
      {/* cuerpo de la vela con rayas en espiral */}
      <rect x={x - 4} y={120} width="8" height="42" rx="3" fill={color} />
      <path
        d={`M${x - 4} 126 l8 6 M${x - 4} 138 l8 6 M${x - 4} 150 l8 6`}
        stroke="#FFFFFF"
        strokeWidth="1.4"
        opacity="0.5"
      />
      {/* mecha */}
      <rect x={x - 1} y={113} width="2" height="9" rx="1" fill="#5b3a2a" />

      {/* Llama animada (path morph + glow) */}
      <AnimatePresence>
        {showFlame && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0, y: -4 }}
            transition={{ duration: 0.35, delay }}
            style={{
              transformOrigin: `${x}px 112px`,
              filter:
                "drop-shadow(0 0 5px rgba(255,210,122,0.9)) drop-shadow(0 0 11px rgba(232,130,159,0.6))",
            }}
          >
            <g
              style={{
                transformOrigin: `${x}px 108px`,
                animation: "flameDance 0.9s ease-in-out infinite",
              }}
            >
              {/* halo externo */}
              <path
                d={`M${x} 96 C${x + 8} 104 ${x + 6} 114 ${x} 116 C${x - 6} 114 ${x - 8} 104 ${x} 96Z`}
                fill="#FFD27A"
                opacity="0.55"
              />
              {/* cuerpo de llama */}
              <path
                d={`M${x} 99 C${x + 5} 105 ${x + 4} 113 ${x} 115 C${x - 4} 113 ${x - 5} 105 ${x} 99Z`}
                fill="url(#flameG)"
              />
              {/* núcleo claro */}
              <path
                d={`M${x} 105 C${x + 2.4} 108 ${x + 2} 112 ${x} 113.5 C${x - 2} 112 ${x - 2.4} 108 ${x} 105Z`}
                fill="#FFF7D6"
              />
            </g>
          </motion.g>
        )}
      </AnimatePresence>

      {/* Humo ondulante cuando se apaga */}
      {out && (
        <g style={{ animation: "smokeRise 2.2s ease-out forwards" }}>
          <path
            d={`M${x} 112 q6 -8 0 -16 q-6 -8 0 -16`}
            stroke="#B9AEB4"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            opacity="0.55"
          />
        </g>
      )}

      {/* Pequeña línea de viento puntual sobre la vela mientras se apaga */}
      {blowing && !out && (
        <motion.path
          d={`M${x - 22} 104 q12 -4 22 0`}
          stroke="#C99BAE"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: [0, 0.8, 0], x: 16 }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </g>
  );
}

// --- Líneas de viento que cruzan el pastel al soplar ---
function WindLines() {
  const lines = [
    { top: "24%", delay: 0 },
    { top: "32%", delay: 0.15 },
    { top: "40%", delay: 0.3 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0">
      {lines.map((l, i) => (
        <motion.svg
          key={i}
          className="absolute left-0"
          style={{ top: l.top }}
          width="340"
          height="30"
          viewBox="0 0 340 30"
          fill="none"
          initial={{ opacity: 0, x: -120 }}
          animate={{ opacity: [0, 0.7, 0], x: 120 }}
          transition={{ duration: 1.2, delay: l.delay, repeat: Infinity }}
        >
          <path
            d="M0 18 Q70 4 140 16 T300 14"
            stroke="#C99BAE"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </motion.svg>
      ))}
    </div>
  );
}
