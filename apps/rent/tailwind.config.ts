import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fbf7f2",
          100: "#f3ead9",
          200: "#e6d2a8",
          300: "#d6b779",
          400: "#c39a55",
          500: "#b08442",
          600: "#946b30",
          700: "#75531f",
          800: "#5a3f17",
          900: "#3f2c10",
        },
      },
      fontFamily: { serif: ["Georgia", "ui-serif", "serif"] },
    },
  },
  plugins: [],
} satisfies Config;
