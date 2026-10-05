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
        // Widox Design System Color Tokens (from https://widox.in/design)
        canvas: "#fffaf0", // Default cream canvas (NON-NEGOTIABLE)
        primary: {
          DEFAULT: "#0a0a0a",
          hover: "#1f1f1f",
        },
        "on-primary": "#ffffff",
        ink: "#0a0a0a",
        "body-strong": "#1a1a1a",
        body: "#3a3a3a",
        muted: "#6a6a6a",
        "muted-soft": "#9a9a9a",
        hairline: "#e5e5e5",
        "hairline-soft": "#ebebeb",

        // Widox Surface Hierarchy
        surface: {
          soft: "#faf5e8",
          card: "#f5f0e0",
          strong: "#ebe6d6",
          dark: "#0a1a1a",
          "dark-elevated": "#1a2a2a",
        },

        // Widox Brand Accents
        brand: {
          pink: "#ff4d8b", // Wordmark dot, growth accent
          teal: "#1a3a3a", // AI & automation surface, featured badges, focus rings
          lavender: "#b8a4ed", // Web App accent
          peach: "#ffb084", // Website dev accent
          ochre: "#e8b94a", // Highlight, speed accent
          mint: "#a4d4c5", // Success accent
          coral: "#ff6b5a",
        },
      },
      fontFamily: {
        display: [
          '"Bricolage Grotesque"',
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        body: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        hand: ['"Kalam"', '"Segoe Print"', "cursive"],
      },
      boxShadow: {
        subtle: "0 2px 12px -2px rgba(10, 10, 10, 0.04), 0 4px 20px -2px rgba(10, 10, 10, 0.03)",
        card: "0 8px 30px -4px rgba(10, 10, 10, 0.06)",
        widox: "0 4px 24px rgba(10, 10, 10, 0.05)",
        floating: "0 20px 40px -10px rgba(10, 10, 10, 0.1)",
      },
      borderRadius: {
        pill: "9999px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.02)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        slideUp: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        scaleIn: "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shimmer: "shimmer 2s infinite linear",
        pulseGlow: "pulseGlow 2s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
