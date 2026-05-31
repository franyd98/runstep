import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#CAFF00",
        "brand-dark": "#a8d400",
        "brand-muted": "#CAFF0020",
        surface: "#111111",
        surface2: "#1a1a1a",
        surface3: "#222222",
        border: "#2a2a2a",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
