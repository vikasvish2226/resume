/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        flame: "#FF6B35",
        ink: "#1F1F1F",
        porcelain: "#FFF9F5",
      },
      boxShadow: {
        soft: "0 14px 45px rgba(31, 31, 31, 0.09)",
      },
    },
  },
  plugins: [],
};
