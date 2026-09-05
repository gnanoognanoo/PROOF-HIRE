import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F6F8FA",
        surface: "#FFFFFF",
        "surface-subtle": "#F3F4F6",
        border: {
          DEFAULT: "#D0D7DE",
          subtle: "#E5E7EB",
          muted: "#F0F2F5",
        },
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#3B82F6",
          600: "#0969DA", // GitHub / ProofHire Corporate Blue
          700: "#0854C0",
          800: "#1E40AF",
        },
        neutral: {
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          500: "#64748B",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
          100: "#F1F5F9",
          50: "#F8FAFC",
        },
        grade: {
          o: {
            bg: "#ECFDF5",
            border: "#A7F3D0",
            text: "#065F46",
            badge: "#10B981"
          },
          a: {
            bg: "#F0F9FF",
            border: "#BAE6FD",
            text: "#0369A1",
            badge: "#0284C7"
          },
          b: {
            bg: "#EEF2FF",
            border: "#C7D2FE",
            text: "#3730A3",
            badge: "#6366F1"
          },
          c: {
            bg: "#FFFBEB",
            border: "#FDE68A",
            text: "#92400E",
            badge: "#F59E0B"
          },
          d: {
            bg: "#FEF2F2",
            border: "#FECACA",
            text: "#991B1B",
            badge: "#EF4444"
          },
          e: {
            bg: "#F3F4F6",
            border: "#E5E7EB",
            text: "#4B5563",
            badge: "#9CA3AF"
          }
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Menlo", "Consolas", "Courier New", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        dropdown: "0 4px 12px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
      }
    },
  },
  plugins: [],
};

export default config;
