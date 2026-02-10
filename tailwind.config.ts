import type { Config } from "tailwindcss";

export default {
  content: [
    "./client/**/*.{html,tsx,ts,jsx,js}",
    "./client/index.html"
  ],
  theme: {
    extend: {
      colors: {
        claude: {
          bg: '#FAF6F0',
          surface: '#FFFFFF',
          primary: '#D97757',
          'primary-hover': '#C4694D',
          'primary-light': '#F5E6DE',
          secondary: '#E8DDD3',
          text: '#1A1612',
          'text-secondary': '#6B635B',
          'text-tertiary': '#9B9189',
          border: '#E8E0D8',
          'border-light': '#F0EAE3',
          sidebar: '#2D2B28',
          'sidebar-hover': '#3D3A36',
          'sidebar-active': '#4A4640',
          accent: '#5B4F43',
          success: '#3D8C6C',
          'success-light': '#E8F5EE',
          danger: '#C75549',
          'danger-light': '#FBEAEA',
          warning: '#D4A04A',
          'warning-light': '#FDF4E3',
        }
      }
    }
  },
  plugins: []
} satisfies Config;
