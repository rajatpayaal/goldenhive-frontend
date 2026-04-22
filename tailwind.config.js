/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gh: {
          plum: "#160327",
          plum2: "#2A0C4A",
          gold: "#F4B229",
          gold2: "#FFC554",
          rose: "#E11D48",
        },
      },
      boxShadow: {
        "gh-soft": "0 18px 45px rgba(2,6,23,0.18)",
      },
    },
  },
  plugins: [],
};

