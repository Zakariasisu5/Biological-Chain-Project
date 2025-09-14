// vite.config.mjs
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { componentTagger } from "lovable-tagger";

// Fix __dirname since it's not available in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  base: process.env.VERCEL ? "/" : (process.env.VITE_BASE_PATH || "/"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // ✅ fixed alias
      buffer: "buffer/",
      util: "util/",
      process: "process/browser",
    },
  },
  define: {
    "process.env": {},
    global: "globalThis",
  },
  optimizeDeps: {
    include: [
      "@walletconnect/web3-provider",
      "ethers",
      "web3",
      "web3modal",
      "buffer",
      "util",
    ],
    esbuildOptions: {
      define: {
        global: "globalThis",
        "process.env": JSON.stringify({}),
      },
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
