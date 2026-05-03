import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        "2xl": "1280px"
      }
    },
    extend: {
      colors: {
        ink: {
          950: "#05060F",
          900: "#0A0C1A",
          800: "#101327",
          700: "#181C36",
          600: "#23284B",
          500: "#3A4070"
        },
        helix: {
          50: "#E9FBF4",
          100: "#C6F4E2",
          200: "#8FE7C5",
          300: "#4FD6A4",
          400: "#22C48A",
          500: "#10B981",
          600: "#0E9E6E",
          700: "#0B7A55",
          800: "#085A3F",
          900: "#063F2C"
        },
        plasma: {
          50: "#EEF1FF",
          100: "#D9DEFF",
          200: "#B3BCFF",
          300: "#8693FF",
          400: "#5C6EFF",
          500: "#3B4DFF",
          600: "#2A38E0",
          700: "#1F2AB0",
          800: "#171F84",
          900: "#10165C"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px -20px rgba(59,77,255,0.45)"
      }
    }
  },
  plugins: []
};

export default config;
