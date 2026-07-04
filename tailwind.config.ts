import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2933",
        paper: "#f7f8f8",
        line: "#d7dcdd",
        jade: {
          50: "#ecfdf9",
          100: "#d1faef",
          600: "#0f766e",
          700: "#0a5f59"
        }
      },
      boxShadow: {
        soft: "0 12px 36px rgba(31, 41, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
