"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Lock } from "lucide-react";
import { useAuth } from "./AuthProvider";

// =====================================================================
// TAROT READING — lectura íntima de 3 cartas, solo para Mafer.
// Fondo oscuro místico propio (excepción al fondo global). Si no es
// Mafer, las cartas permanecen volteadas y bloqueadas.
// =====================================================================

interface TarotCard {
  position: string;
  name: string;
  numeral: string;
  message: string;
  art: ReactNode;
}

const CARDS: TarotCard[] = [
  {
    position: "The Past",
    name: "The Star",
    numeral: "XVII",
    message:
      "Mafer, every step of the path that brought you here had a purpose. The hard nights taught you to shine with your own light, and the small joys grew into roots. Nothing you lived through was in vain: it was all preparing you for this moment.",
    art: <StarArt />,
  },
  {
    position: "The Present",
    name: "The Sun",
    numeral: "XIX",
    message:
      "Today you are light. Not borrowed, not reflected: your own. The universe pauses for a second to celebrate that you exist. You are exactly where you're meant to be, and everything you touch grows warmer. Let yourself feel this happiness without measuring it.",
    art: <SunArt />,
  },
  {
    position: "The Future",
    name: "The Ace of Cups",
    numeral: "Ace",
    message:
      "What's coming is love you didn't expect, abundance that arrives effortlessly, and reunions with who you were before you learned to be afraid. This year brings you blessings you didn't even know you were asking for. Open up, Mafer: the universe is conspiring in your favor.",
    art: <CupArt />,
  },
];

const GOLD = "#D4AF7F";

const FINAL_MESSAGE =
  "The universe blesses you today and every day, Mafer. May this year bring love, abundance, and everything your soul deserves.";

export default function TarotReading() {
  const { isMafer } = useAuth();
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);
  const [flash, setFlash] = useState(false);
  const allRevealed = isMafer && revealed.every(Boolean);

  const reveal = (i: number) => {
    if (!isMafer) return;
    setRevealed((prev) => prev.map((v, idx) => (idx === i ? true : v)));
    // Las estrellas del fondo se intensifican un instante al revelar
    setFlash(true);
    setTimeout(() => setFlash(false), 1300);
  };

  // Lluvia suave de estrellas doradas al revelar las 3
  useEffect(() => {
    if (!allRevealed) return;
    const colors = ["#D4AF7F", "#F5E6D3", "#FFFFFF"];
    const end = Date.now() + 2500;
    const id = setInterval(() => {
      if (Date.now() > end) return clearInterval(id);
      confetti({
        particleCount: 6,
        startVelocity: 0,
        gravity: 0.5,
        ticks: 260,
        shapes: ["star"],
        colors,
        scalar: 1.1,
        zIndex: 200,
        origin: { x: Math.random(), y: -0.05 },
      });
    }, 200);
    return () => clearInterval(id);
  }, [allRevealed]);

  return (
    <section className="relative isolate w-full overflow-hidden px-5 py-16 sm:py-24">
      {/* Fondo oscuro místico (excepción al fondo global) */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: "linear-gradient(160deg, #1a0b1f, #2d1338 55%, #1a0b1f)" }}
      />
      <MysticSky />
      {/* Destello de estrellas al revelar una carta */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(212,175,127,0.22), transparent 60%)" }}
        animate={{ opacity: flash ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Encabezado */}
      <div className="relative z-10 mb-3 flex flex-col items-center text-center">
        <h2 className="font-display text-4xl italic tracking-editorial sm:text-5xl" style={{ color: GOLD }}>
          Your Birthday Reading
        </h2>
        <p className="mt-4 font-body text-base font-light tracking-wide text-rose-100/80">
          Three cards chosen by the universe just for you
        </p>
        {!isMafer && (
          <p className="mt-5 flex items-center gap-2 font-display text-base italic text-gold-soft/80">
            <Lock size={15} strokeWidth={1.5} />
            This reading is only for Mafer
          </p>
        )}
      </div>

      {/* Cartas */}
      <div className="relative z-10 mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
        {CARDS.map((card, i) => {
          const isRevealed = isMafer && revealed[i];
          return (
            <div key={i} className="flex flex-col items-center">
              <p className="mb-4 font-body text-xs font-light uppercase tracking-[0.3em]" style={{ color: GOLD }}>
                {card.position}
              </p>

              <div className="[perspective:1400px]">
                <motion.div
                  className="relative h-[24rem] w-[min(18rem,80vw)] [transform-style:preserve-3d] sm:h-[22rem] sm:w-56"
                  animate={{ rotateY: isRevealed ? 180 : 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Reverso — diseño premium completo para todos (sin
                      overlays de bloqueo; lo único privado es la revelación) */}
                  <div className="absolute inset-0 [backface-visibility:hidden]">
                    <CardShell>
                      <CardBack />
                    </CardShell>
                  </div>

                  {/* Frente */}
                  <div
                    className="absolute inset-0 [backface-visibility:hidden]"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    <CardShell front>
                      <span className="font-display text-sm italic" style={{ color: GOLD }}>
                        {card.numeral}
                      </span>
                      <div className="my-2">{card.art}</div>
                      <span className="font-display text-xl italic" style={{ color: GOLD }}>
                        {card.name}
                      </span>
                      <p className="mt-2 px-1 font-body text-[0.82rem] leading-relaxed text-rose-50/90 sm:text-[0.72rem]">
                        {card.message}
                      </p>
                    </CardShell>
                    {/* Shimmer dorado al revelar */}
                    {isRevealed && <Shimmer />}
                  </div>
                </motion.div>
              </div>

              {/* Acceso */}
              {!isMafer ? (
                <p className="mt-5 flex items-center gap-2 font-display text-sm italic text-gold-soft/70">
                  <Lock size={13} strokeWidth={1.5} />
                  Only Mafer can reveal this card
                </p>
              ) : (
                <button
                  onClick={() => reveal(i)}
                  disabled={revealed[i]}
                  className="mt-5 w-full max-w-[18rem] rounded-full border px-6 py-3 font-body text-sm font-light tracking-wide transition-colors duration-300 enabled:hover:bg-[#D4AF7F]/15 disabled:opacity-40 sm:w-auto sm:py-2.5"
                  style={{ borderColor: GOLD, color: GOLD }}
                >
                  {revealed[i] ? "Revealed" : "Reveal"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Mensaje final: aparece palabra por palabra */}
      <AnimatePresence>
        {allRevealed && (
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mx-auto mt-14 max-w-2xl rounded-3xl border p-6 text-center font-display text-lg italic leading-loose sm:p-8 sm:text-xl"
            style={{ borderColor: `${GOLD}66`, color: GOLD, background: "rgba(255,255,255,0.04)" }}
          >
            {FINAL_MESSAGE.split(" ").map((word, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.4 + i * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}&nbsp;
              </motion.span>
            ))}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}

// --- Cáscara de carta: borde dorado con shimmer + ornamentos ---
function CardShell({ children, front }: { children: ReactNode; front?: boolean }) {
  return (
    // Capa exterior: borde dorado animado (gradiente que se desliza lento)
    <div
      className="relative h-full w-full rounded-2xl p-px"
      style={{
        background:
          "linear-gradient(120deg, #D4AF7F, #F5E6D3, #E8829F, #F5E6D3, #D4AF7F)",
        backgroundSize: "300% 100%",
        animation: "goldSweep 7s linear infinite",
        boxShadow: "0 0 24px rgba(212,175,127,0.18)",
      }}
    >
      <div
        className="relative flex h-full w-full flex-col items-center justify-center rounded-2xl p-4 text-center"
        style={{
          background: front
            ? "linear-gradient(180deg, #241038, #160a22)"
            : "linear-gradient(180deg, #1f0d2e, #15081f)",
          boxShadow: "inset 0 0 30px rgba(212,175,127,0.06)",
        }}
      >
        <CornerFlourish className="absolute left-1.5 top-1.5" />
        <CornerFlourish className="absolute right-1.5 top-1.5 -scale-x-100" />
        <CornerFlourish className="absolute bottom-1.5 left-1.5 -scale-y-100" />
        <CornerFlourish className="absolute bottom-1.5 right-1.5 -scale-100" />
        {children}
      </div>
    </div>
  );
}

function CornerFlourish({ className }: { className?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={GOLD} strokeWidth="1" className={className}>
      <path d="M3 3v8M3 3h8" strokeLinecap="round" />
      <path d="M3 11c5 0 8-3 8-8" opacity="0.7" />
      <circle cx="3" cy="3" r="1.2" fill={GOLD} stroke="none" />
    </svg>
  );
}

// --- Shimmer dorado que cruza la carta al revelar ---
function Shimmer() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
    >
      <motion.div
        className="absolute inset-y-0 w-1/2"
        style={{
          background:
            "linear-gradient(105deg, transparent, rgba(245,230,211,0.5), transparent)",
        }}
        initial={{ x: "-120%" }}
        animate={{ x: "240%" }}
        transition={{ delay: 0.7, duration: 1.1, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

// --- Reverso místico: estrella de 8 puntas, luna, ornamentos déco ---
function CardBack() {
  return (
    <svg width="150" height="250" viewBox="0 0 150 250" fill="none" stroke={GOLD}>
      <rect x="10" y="10" width="130" height="230" rx="10" strokeWidth="0.8" opacity="0.5" />
      <rect x="18" y="18" width="114" height="214" rx="7" strokeWidth="0.6" opacity="0.3" />
      {/* estrella de 8 puntas central */}
      <g transform="translate(75,108)" strokeWidth="1">
        <path d="M0 -34 L7 -7 L34 0 L7 7 L0 34 L-7 7 L-34 0 L-7 -7 Z" fill="rgba(212,175,127,0.08)" />
        <path d="M0 -24 L24 0 L0 24 L-24 0 Z" opacity="0.6" transform="rotate(45)" />
        <circle r="4" fill={GOLD} stroke="none" />
      </g>
      {/* luna creciente */}
      <g transform="translate(75,180)" strokeWidth="1">
        <path d="M8 -14 A14 14 0 1 0 8 14 A11 11 0 1 1 8 -14Z" fill="rgba(212,175,127,0.12)" />
      </g>
      {/* estrellitas dispersas */}
      {[
        [40, 60], [110, 60], [40, 200], [110, 200], [75, 45], [75, 222],
      ].map(([cx, cy], i) => (
        <path key={i} d={`M${cx} ${cy - 5}l1.4 3.6 3.6 1.4-3.6 1.4-1.4 3.6-1.4-3.6-3.6-1.4 3.6-1.4Z`} fill={GOLD} stroke="none" opacity="0.7" />
      ))}
    </svg>
  );
}

// --- Cielo místico de fondo: estrellas, nebulosas, polvo dorado ---
function MysticSky() {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: (i * 8.3 + (i % 7) * 3) % 100,
        top: (i * 11.7 + (i % 5) * 6) % 100,
        size: 1.5 + (i % 3),
        delay: (i % 9) * 0.35,
        gold: i % 4 === 0,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* nebulosas borrosas */}
      <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(120,60,140,0.4), transparent 70%)" }} />
      <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(70,40,110,0.45), transparent 70%)" }} />
      {/* estrellas */}
      {stars.map((s, i) => (
        <span
          key={i}
          // En móvil mostramos ~la mitad de las estrellas (mejor rendimiento).
          className={`absolute animate-twinkle rounded-full ${
            i >= 32 ? "hidden sm:block" : ""
          }`}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            background: s.gold ? GOLD : "#FFFFFF",
            boxShadow: s.gold ? "0 0 6px rgba(212,175,127,0.8)" : "0 0 5px rgba(255,255,255,0.7)",
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ============== ARTE SVG DE LAS CARTAS (line art dorado) ==============

function StarArt() {
  return (
    <svg width="116" height="116" viewBox="0 0 116 116" fill="none" stroke={GOLD} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      {/* estrella de 8 puntas radiante */}
      <g transform="translate(58,40)">
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i * Math.PI) / 8;
          const r = i % 2 ? 26 : 14;
          return <line key={i} x1="0" y1="0" x2={r * Math.cos(a)} y2={r * Math.sin(a)} opacity="0.7" />;
        })}
        <path d="M0 -16 L4 -4 L16 0 L4 4 L0 16 L-4 4 L-16 0 L-4 -4Z" fill="rgba(212,175,127,0.15)" />
      </g>
      {/* figura femenina vertiendo agua */}
      <circle cx="50" cy="70" r="6" />
      <path d="M50 76 q-6 10 -10 22" />
      <path d="M50 80 q8 4 14 14" />
      {/* estanque + chorro */}
      <path d="M62 92 q4 8 -2 12" opacity="0.8" />
      <path d="M30 104 q28 -8 56 0" />
      <path d="M34 104 q24 6 48 0" opacity="0.5" />
    </svg>
  );
}

function SunArt() {
  return (
    <svg width="116" height="116" viewBox="0 0 116 116" fill="none" stroke={GOLD} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      {/* rayos largos y cortos alternados */}
      <g transform="translate(58,46)">
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i * Math.PI) / 8;
          const inner = 24;
          const outer = i % 2 ? 40 : 32;
          return (
            <line key={i} x1={inner * Math.cos(a)} y1={inner * Math.sin(a)} x2={outer * Math.cos(a)} y2={outer * Math.sin(a)} opacity="0.75" />
          );
        })}
        <circle r="22" fill="rgba(212,175,127,0.12)" />
        {/* rostro sereno */}
        <circle cx="-7" cy="-3" r="1.6" fill={GOLD} stroke="none" />
        <circle cx="7" cy="-3" r="1.6" fill={GOLD} stroke="none" />
        <path d="M-7 6 q7 6 14 0" />
      </g>
      {/* girasoles abajo */}
      {[40, 76].map((x) => (
        <g key={x} transform={`translate(${x},100)`}>
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} cx="0" cy="-6" rx="2" ry="4" transform={`rotate(${i * 45})`} opacity="0.7" />
          ))}
          <circle r="3" fill="rgba(212,175,127,0.2)" />
        </g>
      ))}
    </svg>
  );
}

function CupArt() {
  return (
    <svg width="116" height="116" viewBox="0 0 116 116" fill="none" stroke={GOLD} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      {/* paloma sobrevolando */}
      <g transform="translate(58,20)">
        <path d="M-10 0 q10 -8 20 0" />
        <path d="M-4 2 q4 4 0 8" opacity="0.7" />
      </g>
      {/* copa dorada */}
      <path d="M40 44 h36 l-5 22 a13 13 0 0 1 -26 0Z" fill="rgba(212,175,127,0.12)" />
      <rect x="54" y="78" width="8" height="9" rx="1.5" />
      <path d="M44 90 q14 -6 28 0" />
      {/* cinco arroyos desbordando */}
      {[-18, -9, 0, 9, 18].map((dx, i) => (
        <path key={i} d={`M${58 + dx * 0.5} 44 q${dx} 14 ${dx * 1.4} 40`} opacity="0.7" />
      ))}
    </svg>
  );
}
