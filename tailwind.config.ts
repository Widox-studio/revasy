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
        // Revasy Professional SaaS Design System Tokens
        canvas: "#f8fafc", // Ultra-clean porcelain slate canvas
        primary: {
          DEFAULT: "#4f46e5", // Electric Revasy Indigo
          hover: "#4338ca",
        },
        "on-primary": "#ffffff",
        ink: "#0f172a", // Obsidian Slate
        "body-strong": "#1e293b",
        body: "#334155",
        muted: "#64748b",
        "muted-soft": "#94a3b8",
        hairline: "#e2e8f0",
        "hairline-soft": "#f1f5f9",

        // Revasy Surface Hierarchy
        surface: {
          soft: "#f1f5f9",
          card: "#ffffff",
          strong: "#e2e8f0",
          dark: "#0f172a",
          "dark-elevated": "#1e293b",
        },

        // Revasy Vibrant Brand Accents
        brand: {
          pink: "#6366f1", // Revasy Indigo-Violet Flagship Accent
          teal: "#0d9488", // Deep Emerald-Teal
          lavender: "#8b5cf6", // Royal Violet
          peach: "#f97316", // Warm Coral-Peach
          ochre: "#f59e0b", // Golden Amber
          mint: "#10b981", // Fresh Mint-Emerald
          coral: "#f43f5e",
        },
      },
      fontFamily: {
        display: [
          "var(--font-bricolage)",
          '"Bricolage Grotesque"',
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        body: [
          "var(--font-inter)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        sans: [
          "var(--font-inter)",
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
        subtle: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)",
        card: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)",
        widox: "0 10px 30px -4px rgba(79, 70, 229, 0.18), 0 4px 10px -2px rgba(15, 23, 42, 0.04)",
        revasy: "0 10px 30px -4px rgba(79, 70, 229, 0.18), 0 4px 10px -2px rgba(15, 23, 42, 0.04)",
        glow: "0 0 20px -2px rgba(79, 70, 229, 0.25)",
        floating: "0 20px 40px -10px rgba(15, 23, 42, 0.12)",
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
        scaleUp: "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shimmer: "shimmer 1.8s infinite linear",
        pulseGlow: "pulseGlow 2s infinite ease-in-out",
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /(bg|text|border|ring)-brand-(teal|pink|peach|mint|lavender|ochre|coral)(\/[0-9]+)?/,
      variants: ["hover", "focus", "group-hover", "active"],
    },
    "text-amber-800",
    "text-amber-900",
    "text-emerald-800",
    "text-emerald-900",
    "text-purple-900",
    "text-amber-700",
    "text-emerald-700",
    "text-purple-700",
    "break-words",
  ],
};

export default config;
