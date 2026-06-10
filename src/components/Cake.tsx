"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useInView,
  useMotionValue,
  useSpring,
} from "framer-motion";
import Image from "next/image";
import { Lock, Wind, Sparkles } from "lucide-react";
import { useAuth } from "./AuthProvider";
import Fireworks from "./Fireworks";
import { Flourish } from "./SVGIcons";

// =====================================================================
// CAKE — pastel real (/public/cake.png, foto con 6 velas rosas) con una
// llama SVG animada encima de la mecha de CADA vela de la foto: morph de
// path, halo dorado y humo al apagarse. Solo Mafer puede soplar.
// =====================================================================

// --- POSICIONES DE LAS LLAMAS (en % del container del pastel) ----------
// Una por cada vela de la foto (punta de la mecha). AJUSTABLES: si no
// calzan con las velas de cake.png, edita estos valores.
const CANDLE_POSITIONS = [
  { top: 8, left: 26 }, // vela 1 (izquierda, inclinada)
  { top: 6.5, left: 34 }, // vela 2
  { top: 5.5, left: 44.5 }, // vela 3
  { top: 6, left: 53 }, // vela 4
  { top: 6, left: 64 }, // vela 5
  { top: 9.5, left: 70.5 }, // vela 6 (derecha, más baja)
];

// --- Morph de la llama: 4 estados con la MISMA estructura de path -----
// (M + 4 curvas C + Z) para que framer pueda interpolar entre ellos.
const FLAME_PATHS = [
  "M8 2 C11 7 13 11 13 15 C13 19 11 22 8 22 C5 22 3 19 3 15 C3 11 5 7 8 2Z", // normal
  "M8 0 C10 6 11 10 11 15 C11 19 10 22 8 22 C6 22 5 19 5 15 C5 10 6 6 8 0Z", // alta y delgada
  "M7 1 C11 6 12 11 11 15 C10 19 10 22 8 22 C6 22 4 19 5 15 C5 11 3 6 7 1Z", // inclinada izquierda
  "M9 1 C13 6 13 11 12 15 C11 19 10 22 8 22 C6 22 4 19 4 15 C4 11 5 6 9 1Z", // inclinada derecha
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Seed por vela: variación determinista (multiplicadores irracionales) para
// que cada llama tenga su propio ritmo y NUNCA se vean clonadas, sin recurrir
// a Math.random durante el render.
type Seed = {
  flameDur: number;
  flameDelay: number;
  swayDur: number;
  swayDelay: number;
  haloDur: number;
};
const frac = (n: number) => n - Math.floor(n);
const SEEDS: Seed[] = CANDLE_POSITIONS.map((_, i) => ({
  flameDur: 0.22 + frac(i * 0.618 + 0.13) * 0.12,
  flameDelay: frac(i * 0.382 + 0.27) * 0.3,
  swayDur: 1.6 + frac(i * 0.754 + 0.4) * 1.3,
  swayDelay: frac(i * 0.271 + 0.6) * 0.9,
  haloDur: 1.8 + frac(i * 0.487 + 0.9) * 0.8,
}));

// Colores de los pétalos de rosa (módulo → evita deps en useMemo).
const PETAL_COLORS = ["#FBC7D4", "#F4A6BC", "#D4AF7F", "#FFFFFF"];

export default function Cake() {
  const { isMafer, openLogin } = useAuth();
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-120px" });

  const [count, setCount] = useState(0);
  const [hovered, setHovered] = useState(false);

  // Estado de la secuencia de soplido
  const [isBlowing, setIsBlowing] = useState(false);
  const [isBlown, setIsBlown] = useState(false);
  const [gust, setGust] = useState(false); // viento activo (inclina llamas)
  const [blownCandles, setBlownCandles] = useState<number[]>([]);
  const [petals, setPetals] = useState(false);
  const [wished, setWished] = useState(false);

  // Tilt 3D siguiendo el cursor (máx 4°)
  const tiltRef = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sRx = useSpring(rx, { stiffness: 150, damping: 16 });
  const sRy = useSpring(ry, { stiffness: 150, damping: 16 });
  const shake = useAnimationControls();

  const onMove = (e: React.MouseEvent) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 8); // ±0.5 * 8 = ±4°
    rx.set(-py * 8);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    setHovered(false);
  };

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

  // Secuencia cinematográfica de soplido (async, sin loops síncronos)
  const handleBlow = async () => {
    if (!isMafer || isBlowing || isBlown) return;
    setIsBlowing(true);

    // t=0–400ms: VIENTO + temblor de cámara + llamas inclinadas
    setGust(true);
    shake.start({
      rotate: [0, -0.5, 0.6, -0.4, 0.3, 0],
      transition: { duration: 0.35, ease: "easeInOut" },
    });
    await wait(400);
    setGust(false);

    // t=400–1650ms: apagado de velas una por una (250ms entre cada)
    for (let i = 0; i < CANDLE_POSITIONS.length; i++) {
      setBlownCandles((prev) => [...prev, i]);
      await wait(250);
    }

    // t=1700ms: pétalos
    await wait(120);
    setPetals(true);

    // t=1900ms: fuegos artificiales + mensaje final
    await wait(200);
    setWished(true);

    // t=3500ms: botón "Deseo pedido"
    await wait(1300);
    setIsBlown(true);
  };

  return (
    <section
      ref={sectionRef}
      className="relative flex w-full flex-col items-center justify-center px-6 py-16 text-center sm:py-24"
    >
      {/* Fuegos artificiales al completar el soplido */}
      <Fireworks trigger={wished} duration={3500} />

      {/* Pétalos de rosa cayendo */}
      <AnimatePresence>{petals && <PetalFall />}</AnimatePresence>

      {/* Columna central acotada y autocentrada (independiente del ancho del
          padre) → garantiza que todo quede equidistante de ambos bordes. */}
      <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">

      {/* Encabezado */}
      <motion.p
        className="font-display text-3xl italic text-rose-600 sm:text-4xl"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Make a wish
      </motion.p>
      <Flourish width={130} className="mt-3 text-gold-soft/70" />

      {/* Contador 27 — medallón con laureles dorados a cada lado */}
      <motion.div
        className="relative mt-5 flex items-center justify-center gap-1 sm:gap-2"
        initial={{ opacity: 0, scale: 0.7 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 140, damping: 16 }}
      >
        <Laurel />

        <div className="relative flex flex-col items-center">
          {/* halo dorado suave detrás del número */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(212,175,127,0.18), transparent 72%)",
              filter: "blur(18px)",
            }}
          />
          {/* el número: line-height holgado + padding para que el script no se
              corte. El font script italic tiene bearing asimétrico (se ve corrido
              a la derecha), así que lo compensamos con un nudge en em (escala con
              el tamaño en mobile y desktop) para centrarlo entre los laureles.
              Reservamos el ancho del valor final ("27") con un placeholder
              invisible en la misma celda de grid: así el contador (1 dígito → 2
              dígitos) queda siempre centrado en el mismo ancho y NO se desplaza de
              izquierda a derecha en mobile mientras cuenta. */}
          <span
            className="shimmer-gold-deep font-script grid px-3 pb-2 text-center text-[4.6rem] leading-[1.18] sm:text-[6rem]"
            style={{
              filter: "drop-shadow(0 3px 6px rgba(157,23,77,0.32))",
              transform: "translateX(-0.05em)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span aria-hidden className="invisible [grid-area:1/1]">
              27
            </span>
            <span className="justify-self-center [grid-area:1/1]">{count}</span>
          </span>
        </div>

        <Laurel flip />
      </motion.div>

      {/* --- Pastel con velas --- */}
      <motion.div
        ref={tiltRef}
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onLeave}
        className={`relative mx-auto my-8 w-[min(85%,500px)] ${
          isMafer && !isBlown ? "cursor-pointer" : ""
        }`}
        initial={{ opacity: 0, scale: 0.85, y: 60 }}
        animate={
          inView
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 0, scale: 0.85, y: 60 }
        }
        transition={{ type: "spring", stiffness: 60, damping: 14 }}
        style={{ perspective: 900 }}
      >
        <motion.div style={{ rotateX: sRx, rotateY: sRy }}>
          <motion.div
            animate={shake}
            className="relative"
            style={{
              filter:
                "drop-shadow(0 30px 40px rgba(190,24,93,0.25)) drop-shadow(0 60px 80px rgba(190,24,93,0.12))",
            }}
          >
            <Image
              src="/cake.png"
              alt="Pink birthday cake with raspberries and six candles for Mafer"
              width={500}
              height={500}
              priority
              className="h-auto w-full select-none"
              draggable={false}
            />

            {/* Llamas (absolute, en % → escalan con la imagen) sobre cada
                vela de la foto */}
            {CANDLE_POSITIONS.map((pos, i) => (
              <Candle
                key={i}
                index={i}
                pos={pos}
                seed={SEEDS[i]}
                inView={inView}
                blown={blownCandles.includes(i)}
                gust={gust}
                hovered={hovered}
              />
            ))}

            {/* Ráfagas de viento al soplar */}
            <AnimatePresence>{gust && <WindGust />}</AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* --- Mensaje del deseo (palabra por palabra, permanente) --- */}
      <AnimatePresence>
        {wished && (
          <motion.p
            initial={{ opacity: 1 }}
            className="mb-6 text-center font-display italic text-rose-900"
            style={{
              fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
              fontWeight: 400,
              filter: "drop-shadow(0 0 12px rgba(212,175,127,0.4))",
            }}
          >
            {"Your wish is already traveling through the universe".split(" ").map((word, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}&nbsp;
              </motion.span>
            ))}
          </motion.p>
        )}
      </AnimatePresence>

      {/* --- Botón --- */}
      {!isMafer ? (
        <button
          onClick={openLogin}
          className="flex w-full max-w-sm items-center justify-center gap-2 rounded-full border border-rose-400 bg-transparent px-7 py-3 text-center font-body text-base font-light tracking-wide text-rose-600 transition-colors duration-300 hover:bg-rose-100 sm:w-auto sm:max-w-none"
        >
          <Lock size={17} strokeWidth={1.5} />
          Only Mafer can blow out the candles
        </button>
      ) : (
        <AnimatePresence mode="wait">
          {!isBlowing ? (
            <motion.button
              key="blow"
              onClick={handleBlow}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="animate-breath flex w-full max-w-sm items-center justify-center gap-2 rounded-full border border-rose-400 bg-transparent px-8 py-3 font-body text-base font-light tracking-wide text-rose-600 transition-colors duration-300 hover:bg-rose-100 sm:w-auto sm:max-w-none"
            >
              <Wind size={17} strokeWidth={1.5} />
              Blow out the candles
            </motion.button>
          ) : (
            <motion.button
              key="done"
              disabled
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.7, scale: 1 }}
              className="flex w-full max-w-sm items-center justify-center gap-2 rounded-full border border-rose-400 bg-rose-50 px-8 py-3 font-body text-base font-light tracking-wide text-rose-600 sm:w-auto sm:max-w-none"
            >
              <Sparkles size={17} strokeWidth={1.5} />
              Wish made
            </motion.button>
          )}
        </AnimatePresence>
      )}
      </div>
    </section>
  );
}

// ====================== LLAMA SOBRE UNA VELA ======================
// Solo la llama (o el humo al apagarse): el cuerpo de la vela ya viene en
// la foto cake.png. El punto (pos) marca la punta de la mecha; la llama se
// ancla por su base ahí (translate -50% / -85%).
function Candle({
  index,
  pos,
  seed,
  inView,
  blown,
  gust,
  hovered,
}: {
  index: number;
  pos: { top: number; left: number };
  seed: Seed;
  inView: boolean;
  blown: boolean;
  gust: boolean;
  hovered: boolean;
}) {
  return (
    <div
      className="absolute"
      style={{
        top: `${pos.top}%`,
        left: `${pos.left}%`,
        width: "clamp(13px, 4%, 22px)",
        transform: "translate(-50%, -85%)",
      }}
    >
      <motion.div
        className="relative flex items-end justify-center"
        style={{ transformOrigin: "center bottom" }}
        initial={{ opacity: 0, scale: 0, y: 10 }}
        animate={inView ? { opacity: 1, scale: [0, 1.15, 1], y: 0 } : {}}
        // Las llamas se "encienden" una por una a partir de t≈800ms
        transition={{ delay: 0.8 + index * 0.15, duration: 0.6, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          {!blown ? (
            <Flame
              key="flame"
              index={index}
              seed={seed}
              gust={gust}
              hovered={hovered}
              igniteDelay={1.5 + index * 0.2}
            />
          ) : (
            <Smoke key="smoke" />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// --- Llama con morph de path, gradiente premium y halo dorado ---
function Flame({
  index,
  seed,
  gust,
  hovered,
  igniteDelay,
}: {
  index: number;
  seed: Seed;
  gust: boolean;
  hovered: boolean;
  igniteDelay: number;
}) {
  const swayRange = hovered ? 6 : 2.4;
  return (
    <motion.div
      className="relative w-full"
      style={{
        transformOrigin: "center bottom",
        filter:
          "blur(0.4px) drop-shadow(0 0 6px rgba(255,200,100,0.9)) drop-shadow(0 0 14px rgba(255,140,40,0.6)) drop-shadow(0 0 24px rgba(255,80,20,0.3))",
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: [0, 1.3, 1] }}
      exit={{ opacity: 0, scale: 0.4 }}
      transition={{ delay: igniteDelay, duration: 0.5, ease: "easeOut" }}
    >
      {/* Halo dorado pulsante (detrás de la llama) */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[240%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,127,0.6), transparent 70%)",
          filter: "blur(8px)",
        }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: seed.haloDur, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Oscilación viva de fuego (o inclinación fuerte con el viento) */}
      <motion.div
        style={{ transformOrigin: "center bottom" }}
        animate={
          gust
            ? { rotate: 30, scale: 1.3, y: 0 }
            : {
                scale: [0.95, 1.05, 0.97, 1.04, 0.95],
                rotate: [-swayRange, swayRange, -swayRange * 0.8, swayRange, -swayRange],
                y: [1, -1, 0.5, -1, 1],
              }
        }
        transition={
          gust
            ? { duration: 0.25, ease: "easeOut" }
            : {
                duration: seed.swayDur,
                repeat: Infinity,
                ease: "easeInOut",
                delay: seed.swayDelay,
              }
        }
      >
        <svg viewBox="0 0 16 24" className="h-auto w-full">
          <defs>
            <radialGradient id={`flame-${index}`} cx="50%" cy="64%" r="62%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="28%" stopColor="#FEF08A" />
              <stop offset="52%" stopColor="#FBBF24" />
              <stop offset="78%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.15" />
            </radialGradient>
          </defs>
          <motion.path
            fill={`url(#flame-${index})`}
            initial={{ d: FLAME_PATHS[0] }}
            animate={{ d: FLAME_PATHS }}
            transition={{
              duration: seed.flameDur,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              delay: seed.flameDelay,
            }}
          />
          {/* núcleo blanco brillante */}
          <ellipse cx="8" cy="17.5" rx="2.1" ry="3.2" fill="#FFFFFF" opacity="0.9" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// --- Humo ondulante que sube al apagarse la vela ---
function Smoke() {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* rescoldo rojo breve en la mecha */}
      <motion.span
        className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-red-500"
        style={{ boxShadow: "0 0 6px rgba(255,60,20,0.9)" }}
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      />

      {/* voluta principal de humo (path sinuoso que sube y crece) */}
      <motion.svg
        width="26"
        height="120"
        viewBox="0 0 26 120"
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0.6, y: 0, scale: 1 }}
        animate={{ opacity: 0, y: -120, scale: 2 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ transformOrigin: "bottom center" }}
      >
        <motion.path
          fill="none"
          stroke="rgba(156,163,175,0.6)"
          strokeWidth="2.4"
          strokeLinecap="round"
          initial={{ d: "M13 120 q8 -28 0 -56 q-8 -28 0 -56" }}
          animate={{
            d: [
              "M13 120 q8 -28 0 -56 q-8 -28 0 -56",
              "M13 120 q-8 -28 0 -56 q8 -28 0 -56",
              "M13 120 q8 -28 0 -56 q-8 -28 0 -56",
            ],
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </motion.svg>

      {/* partículas extra de humo con drift horizontal */}
      {[
        { x: -8, d: 0, s: 4 },
        { x: 6, d: 0.2, s: 5 },
        { x: -3, d: 0.4, s: 3.5 },
        { x: 9, d: 0.55, s: 4.5 },
        { x: 0, d: 0.3, s: 6 },
      ].map((p, i) => (
        <motion.span
          key={i}
          className="absolute bottom-0 left-1/2 rounded-full bg-gray-400/40 blur-[2px]"
          style={{ width: p.s, height: p.s }}
          initial={{ opacity: 0.5, x: "-50%", y: 0 }}
          animate={{ opacity: 0, x: `calc(-50% + ${p.x}px)`, y: -110, scale: 2 }}
          transition={{ duration: 1.6, delay: p.d, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
}

// --- Ráfagas de viento que cruzan el pastel al soplar ---
function WindGust() {
  const lines = Array.from({ length: 8 }, (_, i) => ({
    top: 10 + i * 8,
    delay: i * 0.04,
    dur: 0.5 + (i % 3) * 0.1,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {lines.map((l, i) => (
        <motion.svg
          key={i}
          className="absolute left-0 w-full"
          style={{ top: `${l.top}%` }}
          viewBox="0 0 200 20"
          fill="none"
          initial={{ opacity: 0, x: "-60%" }}
          animate={{ opacity: [0, 0.5, 0], x: "60%" }}
          transition={{ duration: l.dur, delay: l.delay, ease: "easeOut" }}
        >
          <motion.path
            d="M0 10 Q50 2 100 10 T200 8"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="6 8"
            initial={{ strokeDashoffset: 40 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: l.dur, delay: l.delay }}
          />
        </motion.svg>
      ))}
    </div>
  );
}

// --- Lluvia de pétalos de rosa al soplar (15 pétalos) ---
function PetalFall() {
  const petals = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        left: (i * 6.7 + (i % 5) * 4) % 100,
        delay: (i % 7) * 0.1,
        dur: 3 + (i % 5) * 0.5,
        size: 10 + (i % 3) * 5,
        rot: (i % 2 ? 1 : -1) * (360 + (i % 3) * 120),
        sway: (i % 2 ? 1 : -1) * (20 + (i % 4) * 6),
        color: PETAL_COLORS[i % PETAL_COLORS.length],
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {petals.map((p, i) => (
        <motion.svg
          key={i}
          className="absolute"
          style={{ left: `${p.left}%`, top: -50, width: p.size, height: p.size * 1.3 }}
          viewBox="0 0 20 26"
          initial={{ opacity: 0, y: -50, rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: ["-50px", "100vh"],
            x: [0, p.sway, -p.sway * 0.6, p.sway],
            rotate: p.rot,
          }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeIn" }}
        >
          {/* pétalo: gota/lágrima */}
          <path
            d="M10 0 C16 6 18 14 10 26 C2 14 4 6 10 0Z"
            fill={p.color}
            opacity="0.9"
          />
          <path d="M10 4 C13 9 13 16 10 24" stroke="#00000010" strokeWidth="0.8" fill="none" />
        </motion.svg>
      ))}
    </div>
  );
}

// --- Rama de laurel dorada que enmarca el número (medallón) ---
function Laurel({ flip = false }: { flip?: boolean }) {
  const GOLD = "#D4AF7F";
  // Hojas distribuidas a lo largo de la curva del tallo, girando hacia afuera.
  const leaves = [
    { x: 39, y: 13, r: -54 },
    { x: 29, y: 21, r: -34 },
    { x: 22, y: 31, r: -15 },
    { x: 18, y: 43, r: 4 },
    { x: 18, y: 55, r: 22 },
    { x: 22, y: 67, r: 42 },
    { x: 29, y: 79, r: 62 },
    { x: 39, y: 89, r: 82 },
  ];
  return (
    <svg
      width="42"
      height="104"
      viewBox="0 0 50 104"
      fill="none"
      aria-hidden
      className="h-[78px] w-auto shrink-0 sm:h-[104px]"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      {/* tallo curvo */}
      <path
        d="M45 10 Q15 36 18 56 Q21 82 45 96"
        stroke={GOLD}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* hojas (almendra) con vena central sutil */}
      {leaves.map((l, i) => (
        <g key={i} transform={`rotate(${l.r} ${l.x} ${l.y})`}>
          <ellipse cx={l.x} cy={l.y} rx="3.1" ry="7" fill={GOLD} opacity="0.92" />
          <line
            x1={l.x}
            y1={l.y - 5.5}
            x2={l.x}
            y2={l.y + 5.5}
            stroke="#FFFFFF"
            strokeWidth="0.5"
            opacity="0.3"
          />
        </g>
      ))}
      {/* baya en la punta superior */}
      <circle cx="44" cy="9" r="2" fill={GOLD} />
    </svg>
  );
}
