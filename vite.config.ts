import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/generate-podcast': 'http://localhost:8000',
      '/translate': 'http://localhost:8000',
      '/text-to-speech': 'http://localhost:8000',
      '/static': 'http://localhost:8000',
    }
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
