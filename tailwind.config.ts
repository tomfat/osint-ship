import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f4ff",
          100: "#d9e2ff",
          200: "#b0c3ff",
          300: "#809eff",
          400: "#4f77f9",
          500: "#2b53d6",
          600: "#1b3dad",
          700: "#142f85",
          800: "#0e1f59",
          900: "#091436"
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
