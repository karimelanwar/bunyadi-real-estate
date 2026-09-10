import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#e7f5ee",
          100: "#c6e6d5",
          200: "#9ad3b6",
          300: "#65ba90",
          400: "#37a172",
          500: "#128a57",
          600: "#025636",
          700: "#02482d",
          800: "#023a24",
          900: "#022e1d",
          950: "#011a10",
        },
        sand: {
          50: "#faf9f6",
          100: "#f4f2ec",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px 0 rgba(2, 86, 54, 0.08)",
        cardHover: "0 8px 24px 0 rgba(2, 86, 54, 0.14)",
      },
    },
  },
  plugins: [],
};
export default config;
