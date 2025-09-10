import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  // Use root base when running on Vercel; otherwise allow explicit VITE_BASE_PATH.
  base: process.env.VERCEL ? "/" : (process.env.VITE_BASE_PATH || "/"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // polyfill common node built-ins used by some web3 libs
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
    // force pre-bundling for packages that commonly contain CJS
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
    // help Rollup/esbuild handle mixed CJS/ESM modules at build time
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
