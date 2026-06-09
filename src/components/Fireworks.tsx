"use client";

import { useEffect } from "react";
import { launchFireworks } from "@/lib/fireworks";

// =====================================================================
// FIREWORKS — wrapper declarativo del preset de fuegos artificiales.
// Cada vez que `trigger` cambia a un valor "verdadero" (o se incrementa)
// dispara una tanda de fuegos artificiales premium de `duration` ms.
// No renderiza nada: canvas-confetti pinta sobre su propio canvas fixed.
// =====================================================================

interface FireworksProps {
  /** Cambiar este valor relanza los fuegos (boolean true o contador). */
  trigger: boolean | number;
  /** Duración del espectáculo en milisegundos. */
  duration?: number;
}

export default function Fireworks({ trigger, duration = 9000 }: FireworksProps) {
  useEffect(() => {
    if (!trigger) return;
    const cancel = launchFireworks(duration);
    return cancel;
  }, [trigger, duration]);

  return null;
}
