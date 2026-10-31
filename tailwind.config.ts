import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#F0F4F9",
          100: "#D9E3EF",
          200: "#B3C6DE",
          300: "#8CAACD",
          400: "#5D85B6",
          500: "#32619E",
          600: "#1E477D",
          700: "#143763",
          800: "#0F2E54",
          900: "#0D2748", // Primary Brand Colour
          950: "#07172B",
        },
        gold: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#FFC107", // Secondary Brand Colour
          600: "#D9A205",
          700: "#B48403",
          800: "#926805",
          900: "#785307",
        },
        sand: {
          50: "#FAF9F6",
          100: "#F5F3EF",
          200: "#EAE7DF",
          300: "#DDD8CD",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      lineHeight: {
        relaxed: "1.75",
      },
    },
  },
  plugins: [],
};

export default config;
