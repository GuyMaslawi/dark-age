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
    },
  },
  plugins: [],
};

export default config;
