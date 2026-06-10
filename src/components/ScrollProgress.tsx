"use client";

import { motion, useScroll, useSpring } from "framer-motion";

// =====================================================================
// SCROLL PROGRESS — barra finísima fija arriba del viewport que se llena
// según el porcentaje de scroll. Gradiente rose → gold → rose con un
// resorte suave para que el avance se sienta líquido, no escalonado.
// =====================================================================

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[100] h-[1.5px] origin-left"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, #e8829f 0%, #d4af7f 50%, #e8829f 100%)",
        boxShadow: "0 0 10px rgba(212,175,127,0.5)",
      }}
    />
  );
}
