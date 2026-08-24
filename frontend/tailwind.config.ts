import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* Legacy pulse color (keep for backward compat) */
        pulse: {
          50: "#EFF3FF",
          100: "#DDE8FF",
          200: "#C0D0FF",
          300: "#96B4FF",
          400: "#6690FF",
          500: "#1649FF",
          600: "#1238E8",
          700: "#0F2BB5",
          800: "#0E2490",
          900: "#0D1F73",
        },
        /* New editorial cobalt accent */
        cobalt: {
          50: "#EFF3FF",
          100: "#DDE8FF",
          200: "#C0D0FF",
          300: "#96B4FF",
          400: "#6690FF",
          500: "#1649FF",
          600: "#1238E8",
          700: "#0F2BB5",
          800: "#0E2490",
          900: "#0D1F73",
        },
        /* Warm neutrals for editorial feel */
        paper: {
          DEFAULT: "#F8F7F4",
          dark: "#F0EFEC",
        },
        ink: {
          DEFAULT: "#111110",
          secondary: "#57534E",
          tertiary: "#A8A29E",
        },
        edge: {
          DEFAULT: "#E7E5E0",
          strong: "#C9C5BE",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
