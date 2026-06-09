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

      <div className="group fixed bottom-6 right-6 z-50">
        {/* Tooltip */}
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full border border-rose-200 bg-white/85 px-3 py-1 font-body text-xs font-light tracking-wide text-rose-600 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          Música de cumpleaños
        </span>

        <button
          onClick={toggle}
          aria-label={playing ? "Pausar música" : "Reproducir música"}
          className="relative flex h-14 w-14 items-center justify-center rounded-full border border-rose-400 bg-white/70 text-rose-600 backdrop-blur-md transition-transform duration-300 hover:scale-105"
        >
          {/* Ondas de sonido finas (solo borde) */}
          {playing &&
            [0, 0.5, 1].map((delay, i) => (
              <span
                key={i}
                className="absolute inset-0 rounded-full border border-rose-400"
                style={{ animation: `soundWave 1.6s ease-out ${delay}s infinite` }}
              />
            ))}

          <motion.span
            animate={playing ? { rotate: [0, -10, 10, 0] } : { rotate: 0 }}
            transition={{ duration: 1, repeat: playing ? Infinity : 0 }}
            className="relative z-10"
          >
            <Music size={22} strokeWidth={1.5} />
          </motion.span>
        </button>
      </div>
    </>
  );
}
