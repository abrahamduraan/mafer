import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fijamos la raíz del workspace (hay un package-lock.json suelto un nivel arriba)
  turbopack: {
    root: __dirname,
  },
  // Imágenes externas permitidas:
  //   • Supabase Storage → fotos reales subidas al bucket público
  //   • picsum.photos     → placeholders durante el desarrollo
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pfzhdcjpshjtqhuiaeby.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
