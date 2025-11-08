/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0A84FF",
          50: "#EBF4FF",
          100: "#D7E9FF",
          200: "#AED3FF",
          300: "#85BDFF",
          400: "#5DA7FF",
          500: "#3491FF",
          600: "#0A84FF",
          700: "#0066CC",
          800: "#004C99",
          900: "#003366"
        }
      },
      boxShadow: {
        card: "0 8px 24px rgba(10,132,255,0.08)"
      },
      borderRadius: {
        xl: "1rem"
      }
    }
  },
  plugins: []
}


