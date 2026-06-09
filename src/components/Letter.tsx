"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Flourish } from "./SVGIcons";

// =====================================================================
// LETTER — sobre que se abre con animación premium y carta íntima en
// papel crema texturizado, con sello de cera y firma que se dibuja.
// =====================================================================

const PARAGRAPHS = [
  "Mafer,",
  "Hay personas que llegan a la vida y la cambian sin proponérselo. Tú eres una de esas.",
  "No sé cómo lo haces. Tienes la rara capacidad de hacer que los días normales se sientan importantes y que los días difíciles se vuelvan más livianos. Tu risa se queda con uno mucho después de que te has ido del cuarto.",
  "Hoy cumples veintisiete, y la verdad es que el mundo es mejor porque tú estás en él. Gracias por ser exactamente quien eres: intensa cuando hay que serlo, dulce cuando nadie más se atreve, valiente todos los días aunque a veces no te des cuenta.",
  "Que este año te regrese todo el amor que repartes sin medida. Que tengas más razones para reír de las que puedas contar. Que cada deseo que pidas hoy al soplar las velas se cumpla, incluso los que no te atreves a decir en voz alta.",
  "Feliz cumpleaños, Mafer hermosa.",
  "Te queremos muchísimo.",
];

export default function Letter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setOpened(true), 600);
    return () => clearTimeout(t);
  }, [inView]);

  return (
    <section ref={ref} className="relative w-full px-4 py-24">
      <div className="mb-14 flex flex-col items-center">
        <h2 className="font-display text-4xl italic text-rose-900 tracking-editorial sm:text-5xl">
          Una carta para ti
        </h2>
        <Flourish width={140} className="mt-4 text-gold-soft/70" />
      </div>

      <div className="relative mx-auto max-w-xl" style={{ perspective: "1400px" }}>
        {/* --- Carta --- */}
        <motion.div
          className="relative z-10 mx-auto w-full overflow-hidden rounded-md p-8 sm:p-11"
          style={{
            background: "linear-gradient(180deg, #FFF7EE, #FBEFE2)",
            border: "1px solid #EAD9C2",
            boxShadow: "0 24px 50px -18px rgba(107,30,58,0.3)",
          }}
          initial={{ y: 70, opacity: 0, scale: 0.96 }}
          animate={opened ? { y: 0, opacity: 1, scale: 1 } : { y: 70, opacity: 0, scale: 0.96 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          {/* Manchas sutiles de tiempo */}
          <PaperStains />

          <div className="relative z-10 font-display text-[#5f4636]">
            {PARAGRAPHS.map((p, i) => (
              <motion.p
                key={i}
                className={`mb-4 leading-relaxed ${
                  i === 0 ? "text-2xl italic" : "text-lg sm:text-xl"
                } ${i >= 5 ? "italic text-rose-900" : ""}`}
                initial={{ opacity: 0, y: 10 }}
                animate={opened ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1 + i * 0.25, duration: 0.7 }}
              >
                {p}
              </motion.p>
            ))}

            {/* Firma con flourish que se dibuja */}
            <motion.div
              className="mt-2 flex justify-end"
              initial={{ opacity: 0 }}
              animate={opened ? { opacity: 1 } : {}}
              transition={{ delay: 1 + PARAGRAPHS.length * 0.25 }}
            >
              <svg width="170" height="60" viewBox="0 0 170 60" fill="none">
                <motion.path
                  d="M8 40 C20 10 34 10 40 34 C44 50 52 18 64 30 C74 40 84 8 100 30 C112 46 128 16 150 26 C158 30 162 36 162 40"
                  stroke="#C04870"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={opened ? { pathLength: 1 } : {}}
                  transition={{ delay: 1.2 + PARAGRAPHS.length * 0.25, duration: 1.8, ease: "easeInOut" }}
                />
              </svg>
            </motion.div>
          </div>

          {/* Sello de cera */}
          <motion.div
            className="absolute -bottom-2 right-8 z-20"
            initial={{ scale: 0, rotate: -20 }}
            animate={opened ? { scale: 1, rotate: 0 } : {}}
            transition={{ delay: 1.6 + PARAGRAPHS.length * 0.25, type: "spring", stiffness: 200, damping: 14 }}
          >
            <WaxSeal />
          </motion.div>
        </motion.div>

        {/* --- Sobre: bolsillo frontal + solapa que se abre --- */}
        {/* bolsillo frontal (banda inferior) */}
        <div
          className="absolute inset-x-0 bottom-0 z-20 h-16 rounded-b-md"
          style={{
            background: "linear-gradient(180deg, #F6D9DF, #EFC3CC)",
            clipPath: "polygon(0 100%, 0 30%, 50% 100%, 100% 30%, 100% 100%)",
            boxShadow: "0 12px 24px -10px rgba(107,30,58,0.35)",
          }}
        />
        {/* solapa superior que se abre */}
        <motion.div
          className="absolute inset-x-0 top-0 z-30 origin-top"
          style={{ transformStyle: "preserve-3d" }}
          initial={{ rotateX: 0 }}
          animate={opened ? { rotateX: 180, opacity: 0 } : { rotateX: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          <div
            className="mx-auto h-20 w-full"
            style={{
              background: "linear-gradient(180deg, #F6D9DF, #EFC3CC)",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}

// --- Sello de cera con "M" grabada ---
function WaxSeal() {
  return (
    <svg width="74" height="74" viewBox="0 0 74 74">
      <defs>
        <radialGradient id="wax" cx="38%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#E8829F" />
          <stop offset="70%" stopColor="#C04870" />
          <stop offset="100%" stopColor="#962f53" />
        </radialGradient>
      </defs>
      {/* borde irregular de la cera */}
      <path
        d="M37 4c7-1 12 4 18 6s11 3 12 11-3 12-2 19 0 13-6 17-13 2-19 5-11 5-18 3-9-9-14-13-10-7-10-15 5-11 5-18-2-12 3-17 12-1 19-3 7-7 12-7Z"
        fill="url(#wax)"
      />
      <circle cx="37" cy="37" r="24" fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1.5" />
      <text
        x="37"
        y="50"
        textAnchor="middle"
        fontSize="34"
        fill="#7a2542"
        style={{ fontFamily: "var(--font-display), serif", fontStyle: "italic", fontWeight: 600 }}
      >
        M
      </text>
      <ellipse cx="29" cy="26" rx="6" ry="4" fill="#ffffff" opacity="0.2" />
    </svg>
  );
}

// --- Manchas sutiles de tiempo en el papel ---
function PaperStains() {
  const stains = [
    { left: "12%", top: "18%", r: 40, o: 0.04 },
    { left: "78%", top: "30%", r: 55, o: 0.035 },
    { left: "30%", top: "70%", r: 48, o: 0.04 },
    { left: "65%", top: "82%", r: 36, o: 0.03 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0">
      {stains.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: s.left,
            top: s.top,
            width: s.r,
            height: s.r,
            background: `radial-gradient(circle, rgba(150,90,40,${s.o}), transparent 70%)`,
          }}
        />
      ))}
    </div>
  );
}
