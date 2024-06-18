/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      gridTemplateColumns: {
        "auto-fill-200-300": "repeat(auto-fill, minmax(200px, 1fr))",
      },
      textColor: {
        skin: {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
        },
      },
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",

        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
      },
    },
    daisyui: {
      themes: [
        {
          light: {
            ...require("daisyui/src/theming/themes")["light"],
            primary: "#012883",
            ".btn-primary": {
              "background-color": "#012883",
            },
          },
        },

        "dark",
        "cupcake",
      ],
    },
  },
  plugins: [require("daisyui")],
};
