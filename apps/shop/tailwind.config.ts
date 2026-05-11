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
      fontFamily: {
        serif: ["Georgia", "ui-serif", "serif"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(0.5rem)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-soft": {
          from: { opacity: "0", transform: "translateY(0.25rem)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.45s ease-out both",
        "fade-in-up": "fade-in-up 0.55s ease-out both",
        "fade-in-soft": "fade-in-soft 0.5s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
