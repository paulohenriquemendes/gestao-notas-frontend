/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          700: "#0369a1",
          900: "#0c4a6e"
        }
      },
      boxShadow: {
        soft: "0 20px 45px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
