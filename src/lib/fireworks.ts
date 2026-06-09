import confetti from "canvas-confetti";

// =====================================================================
// FIREWORKS — preset premium de fuegos artificiales con canvas-confetti.
// Explosiones desde puntos aleatorios del cielo que se expanden, caen
// con gravedad y se desvanecen. Paleta: rosa, dorado, blanco, champagne.
// =====================================================================

const FIREWORK_COLORS = [
  "#E8829F", // rosa
  "#C04870", // rosa profundo
  "#D4AF7F", // dorado suave
  "#F5E6D3", // champagne
  "#FFFFFF", // blanco
];

// z-index alto para garantizar que las explosiones queden por encima de
// todo el contenido (botón de música, secciones, etc.).
const Z = 200;

/** Una sola explosión que se expande desde un punto del cielo. */
export function burst(x: number, y: number) {
  const base: confetti.Options = {
    origin: { x, y },
    colors: FIREWORK_COLORS,
    startVelocity: 45,
    gravity: 1.1,
    ticks: 220,
    scalar: 1.1,
    zIndex: Z,
  };

  // Núcleo amplio + estela de chispas finas para el efecto "trail".
  confetti({ ...base, particleCount: 90, spread: 360, decay: 0.91 });
  confetti({
    ...base,
    particleCount: 40,
    spread: 360,
    startVelocity: 28,
    scalar: 0.7,
    decay: 0.89,
  });
}

/**
 * Lanza fuegos artificiales durante `duration` ms: varias explosiones
 * en puntos aleatorios del cielo, calmándose hacia el final.
 * Devuelve una función para cancelar manualmente.
 */
export function launchFireworks(duration = 9000): () => void {
  if (typeof window === "undefined") return () => {};

  const end = Date.now() + duration;
  let raf = 0;
  let timer = 0;

  // Primera tanda inmediata (no esperamos al primer gap).
  burst(0.3 + Math.random() * 0.4, 0.2 + Math.random() * 0.2);

  const tick = () => {
    const remaining = end - Date.now();
    if (remaining <= 0) return;

    // 1–2 explosiones por tanda en la mitad superior del cielo.
    const shots = Math.random() > 0.5 ? 2 : 1;
    for (let s = 0; s < shots; s++) {
      burst(0.12 + Math.random() * 0.76, 0.1 + Math.random() * 0.38);
    }

    // A medida que se acaba el tiempo, las tandas se espacian (se calma).
    const progress = 1 - remaining / duration;
    const gap = 420 + progress * 900;
    timer = window.setTimeout(() => {
      raf = window.requestAnimationFrame(tick);
    }, gap);
  };

  timer = window.setTimeout(() => {
    raf = window.requestAnimationFrame(tick);
  }, 350);

  return () => {
    window.cancelAnimationFrame(raf);
    window.clearTimeout(timer);
  };
}
