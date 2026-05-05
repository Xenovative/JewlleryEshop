import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f6f4fb",
          100: "#e6dff3",
          200: "#c8b8e3",
          500: "#6f47b8",
          600: "#5a3596",
          700: "#452774",
        },
      },
      fontFamily: { serif: ["Georgia", "ui-serif", "serif"] },
    },
  },
  plugins: [],
} satisfies Config;
