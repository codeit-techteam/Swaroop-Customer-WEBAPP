import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          DEFAULT: "#0B2E59",
          50: "#E8EEF5",
          100: "#D1DDEB",
          200: "#A3BBD7",
          300: "#7599C3",
          400: "#4777AF",
          500: "#1E5A9B",
          600: "#0B2E59",
          700: "#09254A",
          800: "#071C38",
          900: "#041226",
        },
        "accent-blue": {
          DEFAULT: "#1E6FFF",
          50: "#E8F1FF",
          100: "#D1E3FF",
          200: "#A3C7FF",
          300: "#75ABFF",
          400: "#478FFF",
          500: "#1E6FFF",
          600: "#1558CC",
          700: "#104299",
          800: "#0A2C66",
          900: "#051633",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "16px",
        "2xl": "16px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(11 46 89 / 0.06), 0 1px 2px -1px rgb(11 46 89 / 0.06)",
        elevated:
          "0 4px 6px -1px rgb(11 46 89 / 0.08), 0 2px 4px -2px rgb(11 46 89 / 0.06)",
        panel:
          "0 10px 15px -3px rgb(11 46 89 / 0.08), 0 4px 6px -4px rgb(11 46 89 / 0.06)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [typography],
};

export default config;
