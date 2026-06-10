"use client";

import { useEffect, useState } from "react";

// =====================================================================
// PAGE CURTAIN — intro curtain. A full-screen rose-100 overlay with the
// name "Mafer" in italic serif that appears and then lifts upward
// (~1.9s), creating the "curtain rising" moment. It unmounts when done
// and respects prefers-reduced-motion (it doesn't appear).
// =====================================================================

export default function PageCurtain() {
  const [show, setShow] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (r) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- decisión única al montar
      setReduced(true);
      setShow(false);
      return;
    }
    const t = setTimeout(() => setShow(false), 1900);
    return () => clearTimeout(t);
  }, []);

  if (reduced || !show) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[300] flex items-center justify-center bg-rose-100"
      style={{
        animation: "curtainUp 0.9s cubic-bezier(0.7,0,0.3,1) 1s forwards",
        willChange: "transform",
      }}
    >
      <span
        className="font-display text-6xl italic text-rose-600 sm:text-7xl"
        style={{
          animation: "curtainName 1.9s ease-in-out forwards",
          textShadow: "0 2px 30px rgba(212,175,127,0.4)",
        }}
      >
        Mafer
      </span>
    </div>
  );
}
