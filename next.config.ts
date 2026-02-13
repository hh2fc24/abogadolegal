import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Avoid Turbopack picking the wrong workspace root when multiple lockfiles exist on the machine.
    root: repoRoot,
  },
  typescript: {
    // !! PELIGRO !!
    // Permite que la aplicación compile exitosamente incluso si tiene errores de tipo.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
