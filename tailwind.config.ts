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
        navy: {
          DEFAULT: "#0B2D56",
          50: "#E8EFF7",
          100: "#C5D5E9",
          200: "#9EBAD9",
          300: "#779EC9",
          400: "#5083B9",
          500: "#0B2D56",
          600: "#092647",
          700: "#071E38",
          800: "#051629",
          900: "#020D1A",
        },
        teal: {
          DEFAULT: "#0E7C7B",
          50: "#E7F5F5",
          100: "#C2E6E6",
          200: "#9DD7D6",
          300: "#78C8C7",
          400: "#53B9B8",
          500: "#0E7C7B",
          600: "#0B6362",
          700: "#084A49",
          800: "#053130",
          900: "#021817",
        },
        background: "#F4F7FA",
        border: "#D0DDE8",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        card: "12px",
      },
      boxShadow: {
        card: "0 1px 4px rgba(11, 45, 86, 0.08)",
        "card-hover": "0 4px 16px rgba(11, 45, 86, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
