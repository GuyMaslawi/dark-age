import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "#0a0a0a",
          soft: "#111112",
          panel: "#161618",
          edge: "#26262a",
        },
        gold: {
          DEFAULT: "#c9a227",
          bright: "#e4c04a",
          dim: "#8a6f1c",
        },
        blood: "#8b1e1e",
        rarity: {
          common: "#b8b8b8",
          uncommon: "#4caf50",
          rare: "#3b82f6",
          epic: "#a855f7",
          legendary: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["var(--font-heebo)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(201,162,39,0.25), 0 8px 30px rgba(0,0,0,0.6)",
      },
      keyframes: {
        hitshake: {
          "0%,100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px) rotate(-1deg)" },
          "40%": { transform: "translateX(5px) rotate(1deg)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(3px)" },
        },
        hitflash: {
          "0%": { opacity: "0" },
          "35%": { opacity: "0.85" },
          "100%": { opacity: "0" },
        },
        floatup: {
          "0%": { opacity: "0", transform: "translate(-50%, 0) scale(0.7)" },
          "20%": { opacity: "1", transform: "translate(-50%, -12px) scale(1)" },
          "100%": { opacity: "0", transform: "translate(-50%, -52px) scale(1)" },
        },
        strike: {
          "0%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(var(--strike-x, 0))" },
          "100%": { transform: "translateX(0)" },
        },
        emberdrift: {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "30%": { opacity: "0.7" },
          "100%": { transform: "translateY(-40px)", opacity: "0" },
        },
        breathe: {
          "0%,100%": { opacity: "0.35" },
          "50%": { opacity: "0.7" },
        },
        dmgfloat: {
          "0%": { opacity: "0", transform: "translate(-50%,0) scale(0.6)" },
          "20%": { opacity: "1", transform: "translate(-50%,-16px) scale(1.1)" },
          "100%": { opacity: "0", transform: "translate(-50%,-70px) scale(1)" },
        },
      },
      animation: {
        hitshake: "hitshake 0.4s ease-in-out",
        hitflash: "hitflash 0.45s ease-out",
        floatup: "floatup 1.1s ease-out forwards",
        strike: "strike 0.35s ease-in-out",
        breathe: "breathe 3.2s ease-in-out infinite",
        dmgfloat: "dmgfloat 1.2s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
