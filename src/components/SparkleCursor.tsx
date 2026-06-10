"use client";

import { useEffect, useRef, useState } from "react";
import { SparkleIcon } from "./SVGIcons";

// =====================================================================
// SPARKLE CURSOR — un pequeño destello dorado que sigue al cursor con un
// retraso suave (lerp). Solo en dispositivos con puntero fino (no touch)
// y respetando prefers-reduced-motion. Nunca captura el puntero.
// =====================================================================

export default function SparkleCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 });
  const visible = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- decisión única al montar
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      visible.current = true;
    };
    const onLeave = () => {
      visible.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);

    let raf = 0;
    const tick = () => {
      // Interpolación suave hacia el cursor (efecto "delay")
      pos.current.x += (target.current.x - pos.current.x) * 0.16;
      pos.current.y += (target.current.y - pos.current.y) * 0.16;
      const el = dotRef.current;
      if (el) {
        el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
        el.style.opacity = visible.current ? "0.7" : "0";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[200] text-gold-soft opacity-0 transition-opacity duration-300"
      style={{ willChange: "transform" }}
    >
      <SparkleIcon size={18} strokeWidth={1.4} />
    </div>
  );
}
