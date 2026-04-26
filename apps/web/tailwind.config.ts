import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}"
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
        },
        cell: "#F5F7FB",
        bone: "#FAFAF7"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,77,255,0.25), transparent 70%)",
        "helix-glow":
          "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(16,185,129,0.18), transparent 70%)",
        "noise":
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/></svg>\")"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px -20px rgba(59,77,255,0.45)",
        cell: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.06), 0 30px 60px -30px rgba(0,0,0,0.6)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        pulseRing: {
          "0%": { transform: "scale(0.95)", opacity: "0.6" },
          "100%": { transform: "scale(1.6)", opacity: "0" }
        },
        auroraSlow: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(80px,-50px,0) scale(1.1)" }
        },
        auroraMedium: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(-60px,40px,0) scale(0.95)" }
        },
        auroraFast: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(40px,-30px,0) scale(1.05)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        pulseRing: "pulseRing 2.4s ease-out infinite",
        "aurora-slow": "auroraSlow 22s ease-in-out infinite",
        "aurora-medium": "auroraMedium 28s ease-in-out infinite",
        "aurora-fast": "auroraFast 18s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
