// =====================================================================
// SVG ICONS — íconos custom dibujados con line-weight fino (stroke 1.5)
// para reemplazar todos los emojis del sitio. Usan currentColor, así que
// el color se controla con `text-*` desde Tailwind.
// =====================================================================

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function HeartIcon({ size = 24, className, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="M12 20.5c-.6 0-1.2-.22-1.67-.65C6.2 16.13 3.5 13.7 3.5 10.4 3.5 8 5.3 6.2 7.6 6.2c1.3 0 2.5.6 3.3 1.6l.1.13.1-.13c.8-1 2-1.6 3.3-1.6 2.3 0 4.1 1.8 4.1 4.2 0 3.3-2.7 5.73-6.83 9.45-.47.43-1.07.65-1.67.65Z" />
    </svg>
  );
}

export function StarIcon({ size = 24, className, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="M12 3.5l2.35 5.1 5.6.62-4.18 3.78 1.16 5.5L12 15.9l-4.93 2.6 1.16-5.5L4.05 9.22l5.6-.62L12 3.5Z" />
    </svg>
  );
}

/** Estrella de 8 puntas (motivo místico para el reverso de cartas). */
export function EightPointStar({ size = 24, className, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="M12 2.5l1.9 6.3 6.6-1.9-4.7 4.7 4.7 4.7-6.6-1.9L12 21.5l-1.9-6.3-6.6 1.9 4.7-4.7-4.7-4.7 6.6 1.9L12 2.5Z" />
    </svg>
  );
}

export function SparkleIcon({ size = 24, className, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="M12 3c.4 3.6 1.4 4.6 5 5-3.6.4-4.6 1.4-5 5-.4-3.6-1.4-4.6-5-5 3.6-.4 4.6-1.4 5-5Z" />
      <path d="M18.5 13.5c.2 1.6.6 2 2.2 2.2-1.6.2-2 .6-2.2 2.2-.2-1.6-.6-2-2.2-2.2 1.6-.2 2-.6 2.2-2.2Z" />
    </svg>
  );
}

export function FlowerIcon({ size = 24, className, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 9.6c0-2.2-.8-4.1 0-5.6.8 1.5 0 3.4 0 5.6Z" />
      <path d="M12 14.4c0 2.2.8 4.1 0 5.6-.8-1.5 0-3.4 0-5.6Z" />
      <path d="M9.6 12c-2.2 0-4.1.8-5.6 0 1.5-.8 3.4 0 5.6 0Z" />
      <path d="M14.4 12c2.2 0 4.1-.8 5.6 0-1.5.8-3.4 0-5.6 0Z" />
      <path d="M10.3 10.3C8.7 8.7 7 7.7 6.5 6 8.2 6.5 9 8.2 10.3 9.5Z" opacity="0.9" />
      <path d="M13.7 13.7c1.6 1.6 3.3 2.6 3.8 4.3-1.7-.5-2.5-2.2-3.8-3.5Z" opacity="0.9" />
    </svg>
  );
}

export function MoonIcon({ size = 24, className, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5Z" />
    </svg>
  );
}

export function EnvelopeIcon({ size = 24, className, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </svg>
  );
}

/** Símbolo de Géminis dibujado a línea (reemplaza el glifo zodiacal). */
export function GeminiGlyph({ size = 24, className, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
      <path d="M5 4c4.5 1.8 9.5 1.8 14 0" />
      <path d="M5 20c4.5-1.8 9.5-1.8 14 0" />
      <path d="M9 4.6v14.8" />
      <path d="M15 4.6v14.8" />
    </svg>
  );
}

/**
 * Separador ornamental tipo flourish (horizontal). `width` controla el
 * ancho total; usa currentColor para el trazo.
 */
export function Flourish({
  width = 160,
  className,
  strokeWidth = 1.25,
}: {
  width?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={width}
      height={(width * 24) / 160}
      viewBox="0 0 160 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      className={className}
    >
      <path d="M2 12h46" />
      <path d="M48 12c6 0 8-6 14-6s8 6 14 6" />
      <path d="M158 12h-46" />
      <path d="M112 12c-6 0-8 6-14 6s-8-6-14-6" />
      <circle cx="80" cy="12" r="3" />
      <path d="M80 5.5l1.2 2.5M80 18.5l1.2-2.5" opacity="0.7" />
    </svg>
  );
}
