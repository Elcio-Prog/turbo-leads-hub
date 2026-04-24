// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: false,
        manifestFilename: "manifest.json",
        includeAssets: ["favicon.ico", "apple-touch-icon.png"],
        devOptions: {
          enabled: false,
        },
        workbox: {
          navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//],
          cleanupOutdatedCaches: true,
        },
        manifest: {
          name: "NTT Indicações",
          short_name: "Indicações",
          description: "Programa interno de indicações de vendas da Net Turbo.",
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait-primary",
          background_color: "#0e0e0e",
          theme_color: "#cafd00",
          categories: ["business", "productivity"],
          lang: "pt-BR",
          icons: [
            { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            {
              src: "/pwa-maskable-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
      }),
    ],
  },
});
