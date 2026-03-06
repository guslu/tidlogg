import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#0B7285",
          foreground: "#E6F4F7"
        },
        "layout-background": "#F3F6FB",
        "layout-sidebar": "#0B1B2A",
        "layout-sidebar-muted": "#112336",
        "layout-card": "#FFFFFF"
      }
    }
  },
  plugins: []
};

export default config;
