"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PetData } from "@/lib/petsData";
import { PET_MESSAGES } from "@/lib/petsData";

// =====================================================================
// PET CARD — un personaje kawaii (SVG chibi) + burbuja de diálogo flotante.
// Cada card aísla sus propios re-renders y timers. Las burbujas se limitan
// globalmente a unas pocas simultáneas para no saturar la pantalla.
// =====================================================================

// --- Limitador global de burbujas simultáneas (máx 4) ---
const MAX_BUBBLES = 4;
let activeBubbles = 0;
const acquireBubble = () => {
  if (activeBubbles < MAX_BUBBLES) {
    activeBubbles += 1;
    return true;
  }
  return false;
};
const releaseBubble = () => {
  activeBubbles = Math.max(0, activeBubbles - 1);
};

// PRNG determinista por semilla (timings desincronizados pero estables).
function makeRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function PetCard({ pet, index }: { pet: PetData; index: number }) {
  const reduce = useReducedMotion();
  const [message, setMessage] = useState<string | null>(null);
  const holdsSlot = useRef(false);
  const rng = useRef(makeRng(pet.seed + 7));

  // Suelta el slot global al desmontar / al ocultar la burbuja.
  const hide = () => {
    setMessage(null);
    if (holdsSlot.current) {
      releaseBubble();
      holdsSlot.current = false;
    }
  };

  // Intenta mostrar una frase (si hay slot libre). Devuelve si lo logró.
  const tryShow = () => {
    if (holdsSlot.current) return true;
    if (!acquireBubble()) return false;
    holdsSlot.current = true;
    const msg = PET_MESSAGES[Math.floor(rng.current() * PET_MESSAGES.length)];
    setMessage(msg);
    return true;
  };

  // Ciclo de burbujas: cada 6–15s intenta hablar 3.5s y programa la próxima.
  useEffect(() => {
    let liveTimer: ReturnType<typeof setTimeout>;
    let nextTimer: ReturnType<typeof setTimeout>;
    let mounted = true;

    const schedule = () => {
      const wait = 6000 + rng.current() * 9000;
      nextTimer = setTimeout(() => {
        if (!mounted) return;
        if (tryShow()) {
          liveTimer = setTimeout(() => {
            if (!mounted) return;
            hide();
            schedule();
          }, 3500);
        } else {
          schedule(); // no había slot, reintenta más tarde
        }
      }, wait);
    };

    schedule();
    return () => {
      mounted = false;
      clearTimeout(liveTimer);
      clearTimeout(nextTimer);
      if (holdsSlot.current) {
        releaseBubble();
        holdsSlot.current = false;
      }
    };
  }, []);

  // Hover: fuerza la burbuja de inmediato si no hay una activa.
  const handleHover = () => {
    if (!message) tryShow();
  };

  // Personajes "curiosos" extra-vivos: yorky angelito y zaguate negra.
  const lively = pet.id === "dog-yorky-angel" || pet.id === "dog-zaguate";

  // Animaciones idle SIEMPRE activas (declarativas con framer-motion, no CSS
  // keyframes → inmunes al media query global de reduced-motion). Seeds
  // deterministas por personaje (no Math.random → estables y desincronizados).
  const r2 = makeRng(pet.seed + 99);
  const breathDur = 3 + r2() * 1; // respiración 3–4s
  const bobDur = 2.6 + r2() * 0.9; // bobbing vertical 2.6–3.5s
  const swayDur = lively ? 3.6 + r2() : 5 + r2() * 2; // curiosos: ladean más rápido
  const breathDelay = r2() * 3;
  const bobDelay = r2() * 2;
  const swayDelay = r2() * 4;
  const swayAmp = lively ? 8 : 2; // curiosos ladean la cabeza más marcado (±8°)

  // Deambular: cada animalito se pasea por su zona con un recorrido y ritmo
  // propios (desincronizado del resto) para que la escena se sienta viva.
  const roamX = 8 + r2() * 8;
  const roamY = 5 + r2() * 7;
  const roamDur = 6 + r2() * 5;
  const roamDelay = r2() * 3;

  return (
    <motion.div
      className="relative flex items-end justify-center"
      // Deambular SIEMPRE activo (cada animalito se pasea por su zona).
      animate={{
        x: [0, roamX, -roamX * 0.6, roamX * 0.4, 0],
        y: [0, -roamY, roamY * 0.5, -roamY * 0.3, 0],
      }}
      transition={{
        duration: roamDur,
        delay: roamDelay,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      }}
    >
      {/* Burbuja de diálogo */}
      <AnimatePresence>
        {message && <Bubble key="bubble" text={message} reduce={!!reduce} />}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={pet.name}
        onHoverStart={handleHover}
        onFocus={handleHover}
        whileHover={reduce ? undefined : { y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 14 }}
        className="relative cursor-pointer bg-transparent outline-none"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {/* sombra ovalada bajo el personaje */}
        <span
          className="pointer-events-none absolute bottom-1 left-1/2 -z-10 -translate-x-1/2 rounded-[50%]"
          style={{
            width: "58%",
            height: "10px",
            background: "rgba(251,199,212,0.5)",
            filter: "blur(4px)",
          }}
        />

        {/* Idle SIEMPRE activo: respiración + bobbing + balanceo, declarativo
            con framer-motion (cada propiedad con su propia duración/delay). */}
        <motion.div
          style={{ transformOrigin: "center 75%" }}
          animate={{
            y: [0, -4, 0],
            rotate: [0, -swayAmp, 0, swayAmp, 0],
            scale: [1, 1.025, 1],
          }}
          transition={{
            y: {
              duration: bobDur,
              repeat: Infinity,
              ease: "easeInOut",
              delay: bobDelay + (index % 4) * 0.12,
            },
            rotate: {
              duration: swayDur,
              repeat: Infinity,
              ease: "easeInOut",
              delay: swayDelay,
            },
            scale: {
              duration: breathDur,
              repeat: Infinity,
              ease: "easeInOut",
              delay: breathDelay,
            },
          }}
        >
          <PetSvg pet={pet} lively={lively} />
        </motion.div>
      </motion.button>
    </motion.div>
  );
}

// --- Burbuja de cómic con cola apuntando al personaje ---
function Bubble({ text, reduce }: { text: string; reduce: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute -top-2 left-1/2 z-30 -translate-x-1/2 -translate-y-full"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0, y: 10 }}
      animate={
        reduce
          ? { opacity: 1 }
          : { opacity: 1, scale: [0, 1.1, 1], y: 0 }
      }
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
    >
      <div
        className="relative max-w-[160px] text-balance rounded-2xl border border-rose-200 bg-white/85 px-3 py-2 text-center text-[13px] font-light leading-snug text-rose-900 shadow-[0_10px_22px_-8px_rgba(190,24,93,0.4)] backdrop-blur-sm"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {text}
        {/* cola triangular */}
        <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-rose-200 bg-white/85" />
      </div>
    </motion.div>
  );
}

// =====================================================================
// SVG del personaje
// =====================================================================
function PetSvg({ pet, lively }: { pet: PetData; lively?: boolean }) {
  const rng = makeRng(pet.seed);
  const blinkDur = (3 + rng() * 3).toFixed(2);
  const blinkDelay = (rng() * 4).toFixed(2);
  const earDur = (1.6 + rng() * 1).toFixed(2);
  const earDelay = (rng() * 1).toFixed(2);
  const tailDur =
    pet.tail === "dog-fast" ? "0.5" : (0.9 + rng() * 0.5).toFixed(2);

  const wrapStyle = pet.glow
    ? { animation: "angelGlow 2.4s ease-in-out infinite" }
    : undefined;

  return (
    <svg
      viewBox="0 0 120 130"
      className="h-auto w-[84px] sm:w-[104px]"
      style={{
        overflow: "visible",
        filter: pet.glow
          ? undefined
          : "drop-shadow(0 8px 10px rgba(192,72,112,0.16))",
        ...wrapStyle,
      }}
    >
      <defs>
        <clipPath id={`head-${pet.id}`}>
          <circle cx="60" cy="54" r="34" />
        </clipPath>
      </defs>

      {/* ===== detrás de la cabeza: alitas, aureola(glow), cola ===== */}
      {pet.accessory === "angel" && <AngelWings color={pet.accent2} />}
      {pet.tail !== "none" && (
        <Tail pet={pet} dur={tailDur} />
      )}

      {/* cuerpo */}
      <Body pet={pet} />

      {/* orejas (algunas detrás de la cabeza) */}
      <Ears pet={pet} earDur={earDur} earDelay={earDelay} />

      {/* cabeza */}
      <circle
        cx="60"
        cy="54"
        r="34"
        fill={pet.body}
        stroke={pet.bodyShade}
        strokeWidth="1.2"
      />

      {/* contorno peludo para los esponjosos */}
      {pet.fluffy && <FluffyOutline color={pet.body} stroke={pet.bodyShade} />}

      {/* marcas de pelaje (clip a la cabeza) */}
      <g clipPath={`url(#head-${pet.id})`}>
        <Markings pet={pet} />
      </g>

      {/* hocico + nariz + boca */}
      <Snout pet={pet} lively={lively} />

      {/* ojos + mejillas */}
      <Eyes pet={pet} blinkDur={blinkDur} blinkDelay={blinkDelay} lively={lively} />
      <circle cx="42" cy="64" r="5" fill={pet.cheek} opacity="0.4" />
      <circle cx="78" cy="64" r="5" fill={pet.cheek} opacity="0.4" />

      {/* bigotes de gato */}
      {pet.kind === "cat" && (
        <g stroke={pet.bodyShade} strokeWidth="1" strokeLinecap="round" opacity="0.7">
          <path d="M40 60 h-14 M40 64 h-13" fill="none" />
          <path d="M80 60 h14 M80 64 h13" fill="none" />
        </g>
      )}

      {/* accesorio frontal */}
      <Accessory pet={pet} earDur={earDur} earDelay={earDelay} />

      {/* sparkles mágicos */}
      {pet.sparkles && <Sparkles seed={pet.seed} />}
    </svg>
  );
}

// --- Cuerpo (normal, alargado o suéter) ---
function Body({ pet }: { pet: PetData }) {
  if (pet.longBody) {
    // dachshund: cuerpo alargado
    return (
      <g>
        <ellipse cx="62" cy="108" rx="34" ry="13" fill={pet.body} stroke={pet.bodyShade} strokeWidth="1.2" />
        <ellipse cx="50" cy="120" rx="5" ry="3.4" fill={pet.bodyShade} />
        <ellipse cx="76" cy="120" rx="5" ry="3.4" fill={pet.bodyShade} />
      </g>
    );
  }
  return (
    <g>
      {/* piecitos */}
      <ellipse cx="50" cy="118" rx="6" ry="4" fill={pet.body} stroke={pet.bodyShade} strokeWidth="1" />
      <ellipse cx="70" cy="118" rx="6" ry="4" fill={pet.body} stroke={pet.bodyShade} strokeWidth="1" />
      {/* torso */}
      <path
        d="M40 112 Q40 86 60 86 Q80 86 80 112 Q60 122 40 112 Z"
        fill={pet.body}
        stroke={pet.bodyShade}
        strokeWidth="1.2"
      />
      {/* pecho claro (tuxedo / siamés / chihuahua) */}
      {(pet.markings === "tuxedo" || pet.markings === "siamese") && (
        <path d="M52 90 Q60 110 68 90 Q60 116 52 90 Z" fill={pet.belly} opacity="0.95" />
      )}
      {pet.fluffy && (
        <path
          d="M40 110 q5 6 10 1 q5 6 10 1 q5 6 10 1 q5 6 10 -1"
          fill="none"
          stroke={pet.bodyShade}
          strokeWidth="1"
          opacity="0.5"
        />
      )}
    </g>
  );
}

// --- Cola ---
function Tail({ pet, dur }: { pet: PetData; dur: string }) {
  return (
    <g
      style={{
        transformOrigin: "86px 110px",
        animation: `tailWag ${dur}s ease-in-out infinite alternate`,
      }}
    >
      <path
        d="M84 108 q26 4 22 -22 q-2 -12 -12 -10 q9 4 8 16 q-2 14 -18 12 Z"
        fill={pet.body}
        stroke={pet.bodyShade}
        strokeWidth="1"
      />
    </g>
  );
}

// --- Orejas ---
function Ears({ pet, earDur, earDelay }: { pet: PetData; earDur: string; earDelay: string }) {
  const wig = (origin: string, extra = 0) => ({
    transformOrigin: origin,
    animation: `earWiggle ${earDur}s ease-in-out ${(+earDelay + extra).toFixed(2)}s infinite`,
  });
  const stroke = pet.bodyShade;

  switch (pet.ears) {
    case "cat":
    case "cat-fluffy":
      return (
        <g>
          <g style={wig("44px 38px")}>
            <polygon points="44,42 34,14 58,34" fill={pet.body} stroke={stroke} strokeWidth="1.2" />
            <polygon points="45,38 40,22 53,34" fill={pet.innerEar} />
            {pet.ears === "cat-fluffy" && (
              <path d="M34 14 l3 6 l4 -4" fill="none" stroke={stroke} strokeWidth="1" />
            )}
          </g>
          <g style={wig("76px 38px", 0.3)}>
            <polygon points="76,42 86,14 62,34" fill={pet.body} stroke={stroke} strokeWidth="1.2" />
            <polygon points="75,38 80,22 67,34" fill={pet.innerEar} />
            {/* puntas oscuras del siamés */}
            {pet.markings === "siamese" && (
              <>
                <polygon points="44,30 34,14 50,24" fill={pet.patch} opacity="0.7" />
                <polygon points="76,30 86,14 70,24" fill={pet.patch} opacity="0.7" />
              </>
            )}
          </g>
        </g>
      );
    case "dog-erect":
      // Orejas paradas de PUNTA REDONDEADA (husky / chihuahua): claramente
      // caninas, no triángulos afilados que podrían leerse como gato/zorro.
      return (
        <g>
          <g style={wig("40px 36px")}>
            <path
              d="M44 40 L33 14 Q30 8 36 12 L56 30 Q48 38 44 40 Z"
              fill={pet.body}
              stroke={stroke}
              strokeWidth="1.2"
            />
            <path d="M45 37 L38 18 Q36 14 40 16 L52 30 Q47 35 45 37 Z" fill={pet.innerEar} />
          </g>
          <g style={wig("80px 36px", 0.25)}>
            <path
              d="M76 40 L87 14 Q90 8 84 12 L64 30 Q72 38 76 40 Z"
              fill={pet.body}
              stroke={stroke}
              strokeWidth="1.2"
            />
            <path d="M75 37 L82 18 Q84 14 80 16 L68 30 Q73 35 75 37 Z" fill={pet.innerEar} />
          </g>
        </g>
      );
    case "dog-semi":
      // zaguate: una parada, una semicaída
      return (
        <g>
          <g style={wig("42px 34px")}>
            <path d="M44 38 L32 8 L58 30 Z" fill={pet.body} stroke={stroke} strokeWidth="1.2" />
            <path d="M45 34 L38 16 L53 30 Z" fill={pet.innerEar} />
          </g>
          <g style={wig("78px 34px", 0.2)}>
            <path d="M74 30 Q92 18 90 44 Q82 50 72 42 Z" fill={pet.body} stroke={stroke} strokeWidth="1.2" />
            <path d="M76 34 Q86 28 85 42 Q80 44 75 40 Z" fill={pet.innerEar} />
          </g>
        </g>
      );
    case "dog-long":
      // orejas largas con pelo (yorky / dachshund)
      return (
        <g>
          <g style={wig("38px 40px")}>
            <path d="M40 40 Q18 44 22 78 Q30 86 40 76 Q34 58 44 44 Z" fill={pet.body} stroke={stroke} strokeWidth="1.2" />
            <path d="M30 50 q-3 14 2 24" stroke={pet.bodyShade} strokeWidth="1" fill="none" opacity="0.5" />
          </g>
          <g style={wig("82px 40px", 0.25)}>
            <path d="M80 40 Q102 44 98 78 Q90 86 80 76 Q86 58 76 44 Z" fill={pet.body} stroke={stroke} strokeWidth="1.2" />
            <path d="M90 50 q3 14 -2 24" stroke={pet.bodyShade} strokeWidth="1" fill="none" opacity="0.5" />
          </g>
        </g>
      );
    case "dog-floppy":
    default:
      return (
        <g>
          <g style={wig("40px 40px")}>
            <ellipse cx="30" cy="64" rx="11" ry="20" fill={pet.body} stroke={stroke} strokeWidth="1.2" />
            <ellipse cx="32" cy="64" rx="5" ry="12" fill={pet.innerEar} opacity="0.7" />
          </g>
          <g style={wig("80px 40px", 0.3)}>
            <ellipse cx="90" cy="64" rx="11" ry="20" fill={pet.body} stroke={stroke} strokeWidth="1.2" />
            <ellipse cx="88" cy="64" rx="5" ry="12" fill={pet.innerEar} opacity="0.7" />
          </g>
        </g>
      );
  }
}

// --- Contorno peludo (esponjosos) ---
function FluffyOutline({ color, stroke }: { color: string; stroke: string }) {
  const bumps = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const cx = 60 + Math.cos(a) * 34;
    const cy = 54 + Math.sin(a) * 34;
    return <circle key={i} cx={cx} cy={cy} r="5" fill={color} stroke={stroke} strokeWidth="0.6" />;
  });
  return <g>{bumps}</g>;
}

// --- Marcas de pelaje ---
function Markings({ pet }: { pet: PetData }) {
  switch (pet.markings) {
    case "siamese":
      return <ellipse cx="60" cy="74" rx="22" ry="16" fill={pet.patch} opacity="0.5" />;
    case "tabby":
      return (
        <g stroke={pet.patch} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8">
          <path d="M48 28 q12 -6 24 0" />
          <path d="M44 34 q16 -6 32 0" />
          <path d="M40 41 q20 -6 40 0" />
          <path d="M60 24 v8" />
        </g>
      );
    case "calico":
      return (
        <g>
          <path d="M28 50 Q34 24 58 28 Q44 40 40 60 Q30 60 28 50 Z" fill={pet.patch} opacity="0.9" />
          <path d="M78 32 Q92 38 90 58 Q80 56 72 40 Z" fill="#2E2A2E" opacity="0.85" />
        </g>
      );
    case "tuxedo":
      return <ellipse cx="60" cy="80" rx="14" ry="9" fill={pet.belly} />;
    case "husky":
      return (
        <g>
          {/* casco gris dejando una franja blanca en la cara */}
          <path d="M26 54 Q30 24 52 26 Q48 44 50 58 Q36 60 26 54 Z" fill={pet.patch} opacity="0.85" />
          <path d="M94 54 Q90 24 68 26 Q72 44 70 58 Q84 60 94 54 Z" fill={pet.patch} opacity="0.85" />
          <ellipse cx="60" cy="74" rx="16" ry="12" fill={pet.belly} opacity="0.9" />
        </g>
      );
    case "yorky":
      return (
        <g>
          <ellipse cx="60" cy="72" rx="22" ry="16" fill={pet.patch} opacity="0.85" />
          {/* flequillo */}
          <path d="M40 34 q20 -10 40 0 q-6 10 -20 10 q-14 0 -20 -10 Z" fill={pet.bodyShade} opacity="0.6" />
        </g>
      );
    default:
      return null;
  }
}

// --- Hocico / nariz / boca + lengua ---
function Snout({ pet, lively }: { pet: PetData; lively?: boolean }) {
  const noseColor = pet.kind === "cat" ? "#E8829F" : "#5b3a4a";
  const mouthStroke = pet.markings === "tuxedo" || pet.body === "#241F24" ? "#C99BAE" : pet.bodyShade;
  const tongue = pet.id === "dog-golden";
  // El zaguate "huele el aire": el hocico se levanta un instante.
  const sniff: React.CSSProperties | undefined =
    pet.id === "dog-zaguate"
      ? { transformOrigin: "60px 60px", animation: "sniffUp 5s ease-in-out infinite" }
      : undefined;

  return (
    <g style={sniff}>
      {/* hocico claro */}
      {pet.snout === "dog-pointy" ? (
        <ellipse cx="60" cy="74" rx="12" ry="10" fill={pet.belly} opacity="0.85" />
      ) : (
        <ellipse cx="60" cy="72" rx="14" ry="9" fill={pet.belly} opacity="0.55" />
      )}

      {/* nariz */}
      {pet.kind === "cat" ? (
        <path d="M56 66 h8 l-4 4 Z" fill={noseColor} />
      ) : (
        <ellipse cx="60" cy="67" rx="4.2" ry="3" fill={noseColor} />
      )}

      {/* boca */}
      <path d="M60 70 v3" stroke={mouthStroke} strokeWidth="1.1" strokeLinecap="round" />
      <path
        d="M60 73 q-3.5 3 -7 0.5 M60 73 q3.5 3 7 0.5"
        stroke={mouthStroke}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* sonrisa ocasional (personajes curiosos): boca más amplia que aparece */}
      {lively && (
        <path
          d="M52 72 q8 8 16 0"
          stroke={mouthStroke}
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          style={{ animation: "occasionalSmile 7s ease-in-out infinite" }}
        />
      )}

      {/* lengüita afuera (golden) */}
      {tongue && (
        <path
          d="M57 75 q3 8 6 0 Z"
          fill="#F48FB1"
          stroke="#E07A98"
          strokeWidth="0.6"
          style={{ transformOrigin: "60px 75px", animation: "tongue 3.4s ease-in-out infinite" }}
        />
      )}
    </g>
  );
}

// --- Ojos (con parpadeo, guiño, brillo y mirada lateral opcional) ---
function Eyes({
  pet,
  blinkDur,
  blinkDelay,
  lively,
}: {
  pet: PetData;
  blinkDur: string;
  blinkDelay: string;
  lively?: boolean;
}) {
  const rx = pet.tiny ? 5.4 : 4.6;
  const ry = pet.tiny ? 7 : 6;
  const shineR = pet.bigShine ? 2.4 : 1.6;
  const blink = (cx: number) => ({
    transformOrigin: `${cx}px 58px`,
    animation: `blink ${blinkDur}s ease-in-out ${blinkDelay}s infinite`,
  });
  // Mirada lateral: los brillos se desplazan a los lados (curiosidad).
  const look: React.CSSProperties | undefined = lively
    ? { animation: "eyeLook 5s ease-in-out infinite" }
    : undefined;

  return (
    <g>
      {/* ojo izquierdo */}
      <g style={blink(48)}>
        <ellipse cx="48" cy="58" rx={rx} ry={ry} fill="#2c1e26" />
        <g style={look}>
          <circle cx={49.4} cy={55.6} r={shineR} fill="#fff" />
          {pet.bigShine && <circle cx={46.6} cy={59} r={shineR * 0.6} fill="#fff" opacity="0.9" />}
        </g>
        {/* tinte de iris */}
        <circle cx="48" cy="59.5" r={rx * 0.7} fill={pet.eye} opacity="0.35" />
      </g>

      {/* ojo derecho (o guiño) */}
      {pet.wink ? (
        <path d="M68 58 q4 4 8 0" stroke="#2c1e26" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <g style={blink(72)}>
          <ellipse cx="72" cy="58" rx={rx} ry={ry} fill="#2c1e26" />
          <g style={look}>
            <circle cx={73.4} cy={55.6} r={shineR} fill="#fff" />
            {pet.bigShine && <circle cx={70.6} cy={59} r={shineR * 0.6} fill="#fff" opacity="0.9" />}
          </g>
          <circle cx="72" cy="59.5" r={rx * 0.7} fill={pet.eye} opacity="0.35" />
        </g>
      )}
    </g>
  );
}

// --- Accesorios frontales ---
function Accessory({ pet, earDur }: { pet: PetData; earDur: string; earDelay: string }) {
  const swing = {
    transformOrigin: "center top",
    animation: `pompomSwing ${(+earDur + 0.6).toFixed(2)}s ease-in-out infinite`,
  };

  switch (pet.accessory) {
    case "ear-bow": {
      // moño en la oreja: izquierda (gato) o derecha-alta (perro floppy)
      const x = pet.kind === "cat" ? 44 : 32;
      const y = pet.kind === "cat" ? 20 : 46;
      return <Bow x={x} y={y} color={pet.accent} dark={pet.accent2} scale={1} style={swing} />;
    }
    case "head-bow":
      // zaguate: moño grande centrado arriba, con vibración entusiasta
      return (
        <Bow
          x={60}
          y={18}
          color={pet.accent}
          dark={pet.accent2}
          scale={1.25}
          style={{ transformOrigin: "60px 18px", animation: "bowJiggle 0.6s ease-in-out infinite" }}
        />
      );
    case "neck-bow":
      return <Bow x={60} y={92} color={pet.accent} dark={pet.accent2} scale={0.9} style={swing} />;
    case "pearls":
      return (
        <g>
          {Array.from({ length: 9 }, (_, i) => {
            const t = i / 8;
            const cx = 40 + t * 40;
            const cy = 90 + Math.sin(t * Math.PI) * 6;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r="2.6" fill={pet.accent} />
                <circle cx={cx - 0.8} cy={cy - 0.8} r="0.9" fill="#fff" opacity="0.9" />
              </g>
            );
          })}
        </g>
      );
    case "scarf":
      return (
        <g>
          <path d="M40 88 Q60 100 80 88 L80 94 Q60 106 40 94 Z" fill={pet.accent} stroke={pet.accent2} strokeWidth="0.8" />
          <path d="M74 92 q10 4 8 18 q-8 2 -10 -6 Z" fill={pet.accent2} />
          <path d="M44 91 Q60 99 76 91" stroke="#ffffff" strokeWidth="1" opacity="0.4" fill="none" />
        </g>
      );
    case "gold-collar":
      return (
        <g>
          <path d="M42 90 Q60 100 78 90" stroke={pet.accent} strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="60" cy="98" r="3.4" fill={pet.accent} stroke={pet.accent2} strokeWidth="0.6" />
          <circle cx="59" cy="97" r="1" fill="#FFF6E6" />
        </g>
      );
    case "ear-flower":
      return <Flower x={80} y={22} petal={pet.accent} center={pet.accent2} />;
    case "party-hat":
      return <PartyHat color={pet.accent} band={pet.accent2} />;
    case "birthday-cone":
      return <BirthdayCone color={pet.accent} dark={pet.accent2} />;
    case "angel":
      return <Halo color={pet.accent} />;
    case "sweater":
      return (
        <g>
          <path d="M40 90 Q40 86 60 86 Q80 86 80 90 L80 114 Q60 122 40 114 Z" fill={pet.accent} stroke={pet.accent2} strokeWidth="1" />
          {/* tejido */}
          <g stroke={pet.accent2} strokeWidth="0.8" opacity="0.6" fill="none">
            <path d="M44 96 H76 M44 102 H76 M44 108 H76" />
            <path d="M50 90 V116 M60 88 V118 M70 90 V116" />
          </g>
          <path d="M40 90 Q60 96 80 90" stroke={pet.accent2} strokeWidth="2" fill="none" opacity="0.7" />
        </g>
      );
    default:
      return null;
  }
}

// --- Moño / lazo ---
function Bow({
  x,
  y,
  color,
  dark,
  scale,
  style,
}: {
  x: number;
  y: number;
  color: string;
  dark: string;
  scale: number;
  style?: React.CSSProperties;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} style={style}>
      <path d="M0 0 L-12 -7 Q-15 0 -12 7 Z" fill={color} stroke={dark} strokeWidth="0.8" />
      <path d="M0 0 L12 -7 Q15 0 12 7 Z" fill={color} stroke={dark} strokeWidth="0.8" />
      <circle r="3.2" fill={dark} />
      <path d="M-11 -5 q3 5 0 10 M11 -5 q-3 5 0 10" stroke="#ffffff" strokeWidth="0.7" opacity="0.4" fill="none" />
    </g>
  );
}

// --- Florecita ---
function Flower({ x, y, petal, center }: { x: number; y: number; petal: string; center: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((d) => (
        <ellipse key={d} cx="0" cy="-5" rx="2.6" ry="4.2" fill={petal} transform={`rotate(${d})`} />
      ))}
      <circle r="2.4" fill={center} />
    </g>
  );
}

// --- Gorro de fiesta dorado con borla ---
function PartyHat({ color, band }: { color: string; band: string }) {
  return (
    <g>
      <polygon points="60,2 48,32 72,32" fill={color} stroke={band} strokeWidth="0.8" />
      <polygon points="60,2 48,32 60,32" fill="#FFFFFF" opacity="0.15" />
      <path d="M48 32 L72 32" stroke={band} strokeWidth="2" strokeLinecap="round" />
      <g style={{ transformOrigin: "60px 2px", animation: "pompomSwing 2.2s ease-in-out infinite" }}>
        <path d="M60 2 q5 -5 2 -9" stroke={band} strokeWidth="1" fill="none" />
        <circle cx="61" cy="-8" r="3.4" fill={band} />
        <circle cx="60" cy="-9" r="1" fill="#FFF6E6" />
      </g>
    </g>
  );
}

// --- Gorrito cónico de cumpleaños (rosa, rayas, pompón) ---
function BirthdayCone({ color, dark }: { color: string; dark: string }) {
  return (
    <g>
      <polygon points="60,0 46,32 74,32" fill={color} stroke={dark} strokeWidth="0.8" />
      <g stroke="#ffffff" strokeWidth="2" opacity="0.6">
        <path d="M55 12 l8 0" />
        <path d="M52 20 l14 0" />
        <path d="M49 28 l20 0" />
      </g>
      <circle cx="60" cy="0" r="3.6" fill="#ffffff" stroke={dark} strokeWidth="0.6" />
    </g>
  );
}

// --- Aureola dorada giratoria + glow ---
function Halo({ color }: { color: string }) {
  return (
    <g style={{ transformOrigin: "60px 12px" }}>
      <g style={{ transformOrigin: "60px 12px", animation: "haloSpin 8s linear infinite" }}>
        <ellipse
          cx="60"
          cy="12"
          rx="16"
          ry="5"
          fill="none"
          stroke={color}
          strokeWidth="3"
          style={{ animation: "haloGlow 2s ease-in-out infinite" }}
        />
      </g>
    </g>
  );
}

// --- Mini alas blancas (detrás del cuerpo, aleteo sutil) ---
function AngelWings({ color }: { color: string }) {
  return (
    <g>
      <g style={{ transformOrigin: "44px 92px", animation: "wingFlap 6s ease-in-out infinite" }}>
        <path d="M44 92 Q22 80 18 96 Q26 100 30 96 Q24 104 34 106 Q42 102 44 92 Z" fill={color} stroke="#E3D9DC" strokeWidth="0.8" />
      </g>
      <g style={{ transformOrigin: "76px 92px", animation: "wingFlap 6s ease-in-out 0.3s infinite" }}>
        <path d="M76 92 Q98 80 102 96 Q94 100 90 96 Q96 104 86 106 Q78 102 76 92 Z" fill={color} stroke="#E3D9DC" strokeWidth="0.8" />
      </g>
    </g>
  );
}

// --- Sparkles dorados alrededor ---
function Sparkles({ seed }: { seed: number }) {
  const rng = makeRng(seed + 555);
  const stars = Array.from({ length: 5 }, () => ({
    x: 8 + rng() * 104,
    y: 6 + rng() * 70,
    s: 2 + rng() * 2.5,
    dur: (2 + rng() * 2).toFixed(2),
    delay: (rng() * 2).toFixed(2),
  }));
  return (
    <g fill="#D4AF7F">
      {stars.map((st, i) => (
        <path
          key={i}
          d={`M${st.x} ${st.y - st.s} L${st.x + st.s * 0.4} ${st.y - st.s * 0.4} L${st.x + st.s} ${st.y} L${st.x + st.s * 0.4} ${st.y + st.s * 0.4} L${st.x} ${st.y + st.s} L${st.x - st.s * 0.4} ${st.y + st.s * 0.4} L${st.x - st.s} ${st.y} L${st.x - st.s * 0.4} ${st.y - st.s * 0.4} Z`}
          style={{ transformOrigin: `${st.x}px ${st.y}px`, animation: `twinkle ${st.dur}s ease-in-out ${st.delay}s infinite` }}
        />
      ))}
    </g>
  );
}
