import type { Config } from "tailwindcss";

// Tailwind v4 — most configuration moves to CSS @theme
// This file is kept for content scanning
const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
};

export default config;
