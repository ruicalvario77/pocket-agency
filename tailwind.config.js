/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/test-tailwind/page.tsx",
  ],
  safelist: [
    "bg-blue-500",
    "p-8",
    "text-white",
    "text-3xl",
    "bg-gray-50",
    "bg-gray-800",
    "bg-gray-900",
  ],
  theme: {
    extend: {
      animation: {
        "fade-in": "fadeIn 0.5s ease-in",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};