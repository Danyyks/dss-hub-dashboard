import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["symbol.svg"],
      manifest: {
        name: "DSS Hub — Dashboard",
        short_name: "DSS Hub",
        description: "Dashboard interno da DSS Hub Tech",
        theme_color: "#18394B",
        background_color: "#18394B",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        icons: [
          { src: "/symbol.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "/symbol.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallbackDenylist: [/^\/__/],
        // Modo "prompt": o novo SW espera o usuário tocar em "Atualizar"
        // (não faz skipWaiting sozinho). Só limpamos caches antigos.
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
