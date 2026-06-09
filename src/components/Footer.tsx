import { Heart } from "lucide-react";
import { Flourish } from "./SVGIcons";

// =====================================================================
// FOOTER — cierre minimalista editorial.
// =====================================================================

export default function Footer() {
  return (
    <footer className="flex w-full flex-col items-center gap-4 bg-transparent px-4 py-14 text-center">
      <Heart
        size={22}
        strokeWidth={1.5}
        className="animate-pulse-soft text-rose-400"
      />
      <Flourish width={120} className="text-gold-soft/60" />
      <p className="font-body text-sm font-light tracking-[0.15em] text-rose-600">
        Hecho con amor para Mafer · 2026
      </p>
    </footer>
  );
}
