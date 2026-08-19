import type { Config } from "tailwindcss";

/**
 * Meridian design system — locked from the 5 Dribbble inspirations:
 *
 *   1. Minimal SaaS typography dashboard      → tabular numerics, generous whitespace, monospace
 *   2. Command line interface web app UI      → `>` prompt motif, shell-style status bar
 *   3. Clean alert notification card design  → severity stripe, mono header, hairline border
 *   4. Cybersecurity dark mode minimal UI    → deep black bg, hairline borders only, no shadows
 *   5. Search bar interaction layout web     → centered single input, suggestion chips below
 *
 * The brand is two colors (black + white). We add a single accent (`lime`) reserved
 * for "ok" severity, and a small palette for severity only (`crit/orange/warn/ok`).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Surfaces — deep, neutral, brutal
        ink: {
          950: "#050505",
          900: "#0a0a0a",
          800: "#101010",
          700: "#161616",
          600: "#1c1c1c",
          500: "#222222",
          400: "#333333",
          300: "#555555",
          200: "#888888",
          100: "#c8c8c8",
          50:  "#f5f5f5",
        },
        // Severity palette — used only on tile stripes and badges
        crit:  "#ff3b30",
        high:  "#ff8a00",
        warn:  "#ffd60a",
        ok:    "#00e676",
        info:  "#5ac8fa",
        // Single accent — used sparingly for cursor and "live" markers
        accent: "#a3ff3a",
      },
      fontFamily: {
        sans: [
          '"Inter"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        serif: ['"Instrument Serif"', '"Times New Roman"', "Times", "serif"],
        mono: [
          "ui-monospace",
          "'JetBrains Mono'",
          "'Cascadia Code'",
          "'IBM Plex Mono'",
          "Consolas",
          "'Courier New'",
          "monospace",
        ],
      },
      letterSpacing: {
        "ultra-tight": "-0.04em",
      },
      borderRadius: {
        none: "0",
        xs: "2px",
        sm: "3px",
      },
      boxShadow: {
        none: "none",
      },
      fontSize: {
        // Compact, all tabular, monospace
        "2xs": ["10px", { lineHeight: "14px" }],
        xs:   ["11px", { lineHeight: "16px" }],
        sm:   ["12px", { lineHeight: "18px" }],
        base: ["13px", { lineHeight: "20px" }],
        md:   ["14px", { lineHeight: "22px" }],
        lg:   ["16px", { lineHeight: "24px" }],
        xl:   ["20px", { lineHeight: "28px" }],
        "2xl":["28px", { lineHeight: "34px" }],
        "3xl":["42px", { lineHeight: "48px" }],
        "4xl":["64px", { lineHeight: "70px" }],
      },
      keyframes: {
        caret: {
          "0%, 49%":  { opacity: "1" },
          "50%, 100%":{ opacity: "0" },
        },
        pulse2: {
          "0%, 100%": { opacity: "0.4" },
          "50%":      { opacity: "1" },
        },
        scan: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        caret: "caret 1.1s steps(1) infinite",
        pulse2:"pulse2 2.4s ease-in-out infinite",
        scan:  "scan 7s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
