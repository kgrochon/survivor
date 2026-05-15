import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** GitHub project Pages: site is /repository-name/. Set `VITE_BASE=gh-pages` in CI only. */
const base = process.env.VITE_BASE === "gh-pages" ? "/survivor/" : "/";

export default defineConfig({
  plugins: [react()],
  base,
});
