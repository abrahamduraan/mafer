import type { Metadata } from "next";
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
  title: "Feliz Cumpleaños, Mafer",
  description:
    "Una celebración hecha con amor para los veintisiete años de Mafer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`h-full antialiased ${cormorant.variable} ${quicksand.variable} ${caveat.variable}`}
    >
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
