/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        foreground: '#111827',
        card: '#FFFFFF',
        'card-foreground': '#111827',
        primary: '#1F2937', /* gray-800 */
        'primary-foreground': '#FFFFFF',
        secondary: '#F3F4F6',
        'secondary-foreground': '#111827',
        accent: '#4B5563',
        border: '#E5E7EB',
        input: '#F3F4F6',
        ring: '#9CA3AF',
      }
    },
  },
  plugins: [],
}