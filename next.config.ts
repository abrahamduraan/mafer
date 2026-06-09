import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fijamos la raíz del workspace (hay un package-lock.json suelto un nivel arriba)
  turbopack: {
    root: __dirname,
  },
  // Permitimos cargar las fotos placeholder de picsum.photos
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
