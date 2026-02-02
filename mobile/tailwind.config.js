/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Semantic colors that adapt to theme
        background: 'var(--color-background)', // #F8FAFC
        surface: 'var(--color-surface)',
        'surface-highlight': 'var(--color-surface-highlight)',
        text: 'var(--color-text)', // #1E293B
        'text-secondary': 'var(--color-text-secondary)',
        border: 'var(--color-border)',

        // Brand colors
        primary: '#3B82F6', // Blue-500
        secondary: '#60A5FA', // Blue-400
        cta: '#F97316', // Orange-500
      },
      fontFamily: {
        heading: ['Outfit_700Bold'],
        body: ['WorkSans_400Regular'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
        xl: '0 20px 25px rgba(0,0,0,0.15)',
      }
    },
  },
  plugins: [],
}
