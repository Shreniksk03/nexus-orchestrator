/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090d16",
        surface: {
          50: "#1e293b",
          100: "#172033",
          200: "#111827",
          300: "#0d131f",
          border: "#1f293d",
          hover: "#1e283d",
        },
        brand: {
          DEFAULT: "#6366f1",
          glow: "#4f46e5",
          light: "#818cf8",
          dark: "#3730a3",
        },
        risk: {
          safe: "#10b981",
          safeBg: "rgba(16, 185, 129, 0.12)",
          warn: "#f59e0b",
          warnBg: "rgba(245, 158, 11, 0.12)",
          critical: "#ef4444",
          criticalBg: "rgba(239, 68, 68, 0.12)",
          info: "#06b6d4",
          infoBg: "rgba(6, 182, 212, 0.12)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Courier New", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(99, 102, 241, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
