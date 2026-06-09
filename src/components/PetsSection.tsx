"use client";

import { motion } from "framer-motion";

// =====================================================================
// PETS SECTION — 6 perritos y 6 gatitos (12 en total) en SVG, sin texto.
// Distribuidos en una grilla responsive. Cada uno tiene su propia paleta
// pastel y tiempos de animación (cola, parpadeo, orejas, flotar) distintos
// para que ninguno se vea idéntico ni sincronizado.
// =====================================================================

// Paletas pastel: cada una define cuerpo, oreja y gorro.
const PALETTES = [
  { body: "#FFF0EB", ear: "#EBC9B8", hat: "#FBC7D4" }, // cream
  { body: "#FDE2E8", ear: "#F0A8BE", hat: "#D4AF7F" }, // rose-100
  { body: "#FBC7D4", ear: "#E8829F", hat: "#F5E6D3" }, // rose-200
  { body: "#E7E0F7", ear: "#C3B2E8", hat: "#FBC7D4" }, // lavender
  { body: "#F5E6D3", ear: "#E6CBA0", hat: "#FBC7D4" }, // champagne
  { body: "#D8F0E2", ear: "#A8D8C0", hat: "#F5E6D3" }, // mint-soft
] as const;

// Comportamientos tipo "animalito": cada perro/gato hace algo distinto.
//  - dogs: wagWalk (mueve cola caminando), chaseTail (se persigue la cola),
//          hop (saltitos de emoción)
//  - cats: lickPaw (se chupa la patita), groom (se acicala), tailFlick (cola
//          que se mueve mientras observa quieto)
type DogBehavior = "wagWalk" | "chaseTail" | "hop";
type CatBehavior = "lickPaw" | "groom" | "tailFlick";
type Behavior = DogBehavior | CatBehavior;

type Pet = {
  type: "dog" | "cat";
  behavior: Behavior;
  body: string;
  ear: string;
  hat: string;
  // tiempos individuales para desincronizar
  tailDur: number;
  tailDelay: number;
  blinkDelay: number;
  earDur: number;
  earDelay: number;
  cycleDur: number;
  cycleDelay: number;
};

const DOG_BEHAVIORS: DogBehavior[] = ["wagWalk", "chaseTail", "hop"];
const CAT_BEHAVIORS: CatBehavior[] = ["lickPaw", "groom", "tailFlick"];

// 6 perros + 6 gatos, intercalados, cada uno con paleta, comportamiento y
// tiempos propios para que ninguno se vea ni se mueva igual que otro.
const PETS: Pet[] = Array.from({ length: 12 }, (_, i) => {
  const palette = PALETTES[i % PALETTES.length];
  const isDog = i % 2 === 0;
  const order = Math.floor(i / 2); // 0..5 dentro de su especie
  return {
    type: isDog ? "dog" : "cat",
    behavior: isDog
      ? DOG_BEHAVIORS[order % DOG_BEHAVIORS.length]
      : CAT_BEHAVIORS[order % CAT_BEHAVIORS.length],
    body: palette.body,
    ear: palette.ear,
    hat: palette.hat,
    tailDur: 0.6 + (i % 4) * 0.16,
    tailDelay: (i % 5) * 0.21,
    blinkDelay: (i % 6) * 0.63 + 0.2,
    earDur: 1.5 + (i % 3) * 0.4,
    earDelay: (i % 4) * 0.33,
    cycleDur: 3.4 + (order % 3) * 0.7,
    cycleDelay: (i % 6) * 0.5,
  };
});

// Traduce el comportamiento a props de animación (animate + transition + estilo).
function behaviorMotion(pet: Pet): {
  animate: Record<string, number[]>;
  transition: object;
  transformOrigin: string;
} {
  const base = {
    repeat: Infinity,
    repeatDelay: 1.2,
    ease: "easeInOut" as const,
    delay: pet.cycleDelay,
  };
  switch (pet.behavior) {
    case "wagWalk":
      return {
        animate: { y: [0, -7, 0], rotate: [-2, 2, -2] },
        transition: { ...base, repeatDelay: 0, duration: pet.cycleDur },
        transformOrigin: "center bottom",
      };
    case "chaseTail":
      return {
        animate: { rotate: [0, 0, 360, 360], y: [0, -3, -3, 0] },
        transition: {
          ...base,
          duration: pet.cycleDur + 1.4,
          times: [0, 0.68, 0.9, 1],
        },
        transformOrigin: "center center",
      };
    case "hop":
      return {
        animate: { y: [0, -20, 0, 0, 0], rotate: [0, -3, 0, 0, 0] },
        transition: {
          ...base,
          duration: pet.cycleDur,
          times: [0, 0.18, 0.36, 0.6, 1],
          ease: "easeOut",
        },
        transformOrigin: "center bottom",
      };
    case "lickPaw":
      return {
        animate: { rotate: [0, 0, 16, 16, 0], y: [0, 0, 5, 5, 0] },
        transition: {
          ...base,
          duration: pet.cycleDur + 1,
          times: [0, 0.45, 0.6, 0.82, 1],
        },
        transformOrigin: "center bottom",
      };
    case "groom":
      return {
        animate: { scaleY: [1, 1, 0.92, 1, 1], y: [0, 0, 4, 0, 0] },
        transition: {
          ...base,
          duration: pet.cycleDur,
          times: [0, 0.4, 0.55, 0.7, 1],
        },
        transformOrigin: "center bottom",
      };
    case "tailFlick":
    default:
      return {
        animate: { rotate: [-1.5, 1.5, -1.5], y: [0, -3, 0] },
        transition: { ...base, repeatDelay: 0, duration: pet.cycleDur },
        transformOrigin: "center bottom",
      };
  }
}

export default function PetsSection() {
  return (
    <section className="relative w-full overflow-hidden px-4 py-20">
      <div className="mx-auto grid max-w-5xl grid-cols-3 place-items-center gap-y-8 gap-x-2 sm:grid-cols-4 lg:grid-cols-6">
        {PETS.map((pet, i) => {
          const move = behaviorMotion(pet);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (i % 6) * 0.1, duration: 0.8 }}
            >
              {/* Comportamiento propio: cola, saltos, perseguir cola,
                  chuparse la patita, acicalarse... cada uno a su ritmo */}
              <motion.div
                animate={move.animate}
                transition={move.transition}
                style={{ transformOrigin: move.transformOrigin }}
              >
                {pet.type === "dog" ? <Dog pet={pet} /> : <Cat pet={pet} />}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// --- Gorro de fiesta elegante (borla dorada, banda dorada, sin rayas) ---
function PartyHat({ color }: { color: string }) {
  return (
    <g>
      <path d="M60 8 q4 -4 2 -8" stroke="#D4AF7F" strokeWidth="1" fill="none" />
      <polygon points="60,8 46,42 74,42" fill={color} />
      <polygon points="60,8 46,42 60,42" fill="#FFFFFF" opacity="0.16" />
      <path d="M46 42 L74 42" stroke="#D4AF7F" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="6" r="3.5" fill="#D4AF7F" />
      <circle cx="59" cy="5" r="1" fill="#F5E6D3" />
    </g>
  );
}

// --- Cara refinada (ojos con brillo, parpadeo, boca fina) ---
function RefinedFace({ blinkDelay }: { blinkDelay: number }) {
  return (
    <g>
      <g style={{ transformOrigin: "48px 70px", animation: `blink 3.6s ease-in-out ${blinkDelay}s infinite` }}>
        <circle cx="48" cy="70" r="5" fill="#5b3a4a" />
        <circle cx="49.6" cy="68.4" r="1.6" fill="#fff" />
      </g>
      <g style={{ transformOrigin: "72px 70px", animation: `blink 3.6s ease-in-out ${blinkDelay}s infinite` }}>
        <circle cx="72" cy="70" r="5" fill="#5b3a4a" />
        <circle cx="73.6" cy="68.4" r="1.6" fill="#fff" />
      </g>
      <path d="M55 80 q5 4 10 0" stroke="#9c6b7e" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
  );
}

// --- Perrito ---
function Dog({ pet }: { pet: Pet }) {
  return (
    <svg width="108" height="126" viewBox="0 0 120 140">
      <PartyHat color={pet.hat} />
      <ellipse cx="30" cy="74" rx="10" ry="19" fill={pet.ear} />
      <ellipse cx="90" cy="74" rx="10" ry="19" fill={pet.ear} />
      <circle cx="60" cy="72" r="33" fill={pet.body} stroke="#E3B9C6" strokeWidth="1" />
      <ellipse cx="60" cy="86" rx="13" ry="9" fill="#FFFFFF" opacity="0.5" />
      <ellipse cx="60" cy="78" rx="3.6" ry="2.8" fill="#5b3a4a" />
      <RefinedFace blinkDelay={pet.blinkDelay} />
      <ellipse cx="60" cy="120" rx="21" ry="15" fill={pet.body} stroke="#E3B9C6" strokeWidth="1" />
      <g style={{ transformOrigin: "82px 118px", animation: `tailWag ${pet.tailDur}s ease-in-out ${pet.tailDelay}s infinite alternate` }}>
        <path d="M82 118 q18 -4 16 -18" stroke={pet.ear} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// --- Gatito ---
function Cat({ pet }: { pet: Pet }) {
  return (
    <svg width="108" height="126" viewBox="0 0 120 140">
      <PartyHat color={pet.hat} />
      <g style={{ transformOrigin: "38px 50px", animation: `earWiggle ${pet.earDur}s ease-in-out ${pet.earDelay}s infinite` }}>
        <polygon points="30,58 38,32 51,52" fill={pet.body} stroke="#E3B9C6" strokeWidth="1" />
        <polygon points="34,54 39,40 47,50" fill={pet.ear} />
      </g>
      <g style={{ transformOrigin: "82px 50px", animation: `earWiggle ${pet.earDur}s ease-in-out ${pet.earDelay + 0.3}s infinite` }}>
        <polygon points="90,58 82,32 69,52" fill={pet.body} stroke="#E3B9C6" strokeWidth="1" />
        <polygon points="86,54 81,40 73,50" fill={pet.ear} />
      </g>
      <circle cx="60" cy="72" r="33" fill={pet.body} stroke="#E3B9C6" strokeWidth="1" />
      <path d="M57 78 h6 l-3 3.5 Z" fill="#E8829F" />
      <RefinedFace blinkDelay={pet.blinkDelay} />
      <path d="M40 79 h-13 M40 83 h-12" stroke="#C99BAE" strokeWidth="1" strokeLinecap="round" />
      <path d="M80 79 h13 M80 83 h12" stroke="#C99BAE" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="60" cy="120" rx="21" ry="15" fill={pet.body} stroke="#E3B9C6" strokeWidth="1" />
      <g style={{ transformOrigin: "82px 122px", animation: `tailWag ${pet.tailDur}s ease-in-out ${pet.tailDelay}s infinite alternate` }}>
        <path d="M80 124 q20 2 14 -16" stroke={pet.ear} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
