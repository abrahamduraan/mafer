"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Music } from "lucide-react";

// =====================================================================
// MUSIC BUTTON — botón flotante para la canción de cumpleaños.
// Agrega birthday.mp3 en /public/. Si no existe, simplemente no suena.
// =====================================================================

export default function MusicButton() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/birthday.mp3" loop preload="none" />

      <div className="group pb-safe fixed right-4 z-50">
        {/* Tooltip premium: fade + scale */}
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 origin-right -translate-y-1/2 scale-90 whitespace-nowrap rounded-full border border-rose-200 bg-white/85 px-3 py-1 font-body text-xs font-light tracking-wide text-rose-600 opacity-0 backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100">
          {playing ? "Playing for you" : "Birthday music"}
        </span>

        <button
          onClick={toggle}
          aria-label={playing ? "Pause music" : "Play music"}
          className="relative flex h-14 w-14 items-center justify-center rounded-full border border-rose-400 bg-white/70 text-rose-600 backdrop-blur-md transition-transform duration-300 hover:scale-105"
        >
          {/* Ondas de sonido en 3 capas a velocidades distintas */}
          {playing &&
            [
              { delay: 0, dur: 1.6 },
              { delay: 0.5, dur: 2.1 },
              { delay: 1, dur: 2.6 },
            ].map((w, i) => (
              <span
                key={i}
                className="absolute inset-0 rounded-full border border-rose-400"
                style={{ animation: `soundWave ${w.dur}s ease-out ${w.delay}s infinite` }}
              />
            ))}

          {/* Vinilo girando cuando suena; nota musical cuando está en pausa */}
          {playing ? (
            <motion.span
              className="relative z-10"
              animate={{ rotate: 360 }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
            >
              <Vinyl size={26} />
            </motion.span>
          ) : (
            <span className="relative z-10">
              <Music size={22} strokeWidth={1.5} />
            </span>
          )}
        </button>
      </div>
    </>
  );
}

// --- Disco de vinilo (gira cuando la música está sonando) ---
function Vinyl({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10.5" fill="#6b1e3a" />
      <circle cx="12" cy="12" r="10.5" stroke="#C04870" strokeWidth="0.6" />
      <circle cx="12" cy="12" r="7.5" stroke="#E8829F" strokeWidth="0.5" opacity="0.5" />
      <circle cx="12" cy="12" r="5.4" stroke="#E8829F" strokeWidth="0.5" opacity="0.4" />
      {/* etiqueta central rosa */}
      <circle cx="12" cy="12" r="3.4" fill="#FBC7D4" />
      <circle cx="12" cy="12" r="0.8" fill="#6b1e3a" />
      {/* brillo especular */}
      <path d="M7 6.5a8 8 0 0 1 4-1.4" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}
