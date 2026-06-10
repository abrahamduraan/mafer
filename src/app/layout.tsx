import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Quicksand, Caveat } from "next/font/google";
import "./globals.css";

// =====================================================================
// Tipografía editorial premium:
//   • Cormorant Garamond → titulares serif elegantes (incluye italic)
//   • Quicksand          → cuerpo sans-serif limpio
//   • Caveat             → manuscrita para captions de las polaroids
// Cada fuente expone su propia CSS variable, consumida desde globals.css.
// =====================================================================

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--ff-display",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--ff-body",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ff-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "itsmafersbirthday",
  description: "Un regalo especial para tu día.",
  openGraph: {
    title: "Feliz Cumpleaños Mafer",
    description: "Un regalo especial para tu día.",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Feliz Cumpleaños Mafer",
      },
    ],
  },
  // Sitio privado de cumpleaños: lo mantenemos fuera de los buscadores.
  robots: {
    index: false,
    follow: false,
  },
};

// Viewport responsive: ancho del dispositivo, escala inicial 1 y zoom
// permitido hasta 5x (accesibilidad — no bloqueamos el pinch-to-zoom).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FFF5F7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${cormorant.variable} ${quicksand.variable} ${caveat.variable}`}
    >
      <body className="flex min-h-[100dvh] flex-col font-body">{children}</body>
    </html>
  );
}
