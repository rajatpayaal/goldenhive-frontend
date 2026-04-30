/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gh: {
          primary: "#F4B740",     // Yellow from Figma
          navy: "#111827",        // Dark background/text
          muted: "#6B7280",       // Muted text
          light: "#F9FAFB",       // Light background
          rose: "#E11D48",        // Pink/Red primary action alternative
          pink: "#FF4F8A",        // Pink gradient stop
          gold: "#F4B229",        // Legacy gold (keep for backward compatibility temporarily)
          gold2: "#FFC554",       // Legacy
          plum: "#160327",        // Legacy plum
        },
      },
      boxShadow: {
        "gh-soft": "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)", // Softer shadow for cards
        "gh-medium": "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

