import type { Config } from "tailwindcss";

export default {
  content: [
    "./client/**/*.{html,tsx,ts,jsx,js}",
    "./client/index.html"
  ],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config;
