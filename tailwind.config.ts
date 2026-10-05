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
        cafe: {
          50: "#faf5ef",
          100: "#f4e9de",
          200: "#ebd4be",
          300: "#dfb999",
          400: "#d09871",
          500: "#c47c4e",
          600: "#b66742",
          700: "#985137",
          800: "#7c4331",
          900: "#65392b",
          950: "#361b14",
        },
        espresso: {
          DEFAULT: "#1f1412",
          dark: "#140c0b",
          light: "#33211d",
          muted: "#4e3933",
        },
        crema: {
          DEFAULT: "#fdfbf7",
          warm: "#f7f1e7",
          soft: "#f1e7d8",
        },
        amberGold: {
          DEFAULT: "#d97706",
          dark: "#b45309",
          light: "#f59e0b",
        }
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 10px -2px rgba(31, 20, 18, 0.05), 0 4px 20px -2px rgba(31, 20, 18, 0.04)",
        card: "0 10px 30px -5px rgba(31, 20, 18, 0.08)",
        floating: "0 20px 40px -10px rgba(31, 20, 18, 0.12)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
