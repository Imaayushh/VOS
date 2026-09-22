/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        surface: "#0d1424",
        surfaceBorder: "#1e293b",
        neonCyan: "#00f0ff",
        neonEmerald: "#10b981",
        neonAmber: "#f59e0b",
        neonRose: "#f43f5e",
        neonPurple: "#a855f7",
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -3px rgba(0, 240, 255, 0.4)',
        'neon-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.4)',
        'neon-amber': '0 0 20px -3px rgba(245, 158, 11, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
