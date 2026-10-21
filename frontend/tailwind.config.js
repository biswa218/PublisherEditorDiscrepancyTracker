/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#002046",
        "on-primary": "#ffffff",
        "primary-container": "#1b365d",
        "on-primary-container": "#87a0cd",
        "primary-fixed": "#d6e3ff",
        "primary-fixed-dim": "#aec7f7",
        "on-primary-fixed": "#001b3d",
        "on-primary-fixed-variant": "#2e476f",
        "secondary": "#00677e",
        "on-secondary": "#ffffff",
        "secondary-container": "#8ce0fd",
        "on-secondary-container": "#00647b",
        "secondary-fixed": "#b5ebff",
        "secondary-fixed-dim": "#7ed2ef",
        "tertiary": "#361900",
        "tertiary-container": "#552b00",
        "on-tertiary-container": "#eb851c",
        "surface": "#f7f9ff",
        "surface-bright": "#f7f9ff",
        "surface-dim": "#c7dcf4",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#edf4ff",
        "surface-container": "#e3efff",
        "surface-container-high": "#d8eaff",
        "surface-container-highest": "#cfe5fd",
        "on-surface": "#061d2f",
        "on-surface-variant": "#44474e",
        "outline": "#74777f",
        "outline-variant": "#c4c6cf",
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        "surface-tint": "#465f88"
      },
      fontFamily: {
        sans: ["Source Sans 3", "Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    },
  },
  plugins: [],
}

