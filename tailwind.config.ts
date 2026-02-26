import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAF8",
        primary: "#1A1A18",
        secondary: "#8A8A82",
        accent: "#C4B5A0",
        "accent-secondary": "#E8E4DE",
        link: "#5A5A52",
        "image-placeholder": "#F0EEEA",
      },
      fontFamily: {
        serif: [
          "var(--font-instrument)",
          '"Playfair Display"',
          '"Cormorant Garamond"',
          "serif",
        ],
        sans: [
          "var(--font-inter)",
          '"IBM Plex Sans"',
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-jetbrains)", '"IBM Plex Mono"', "monospace"],
      },
      fontSize: {
        "page-title": [
          "48px",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        "page-title-mobile": [
          "32px",
          { lineHeight: "1.15", letterSpacing: "-0.02em" },
        ],
        "section-heading": ["28px", { lineHeight: "1.3" }],
        "section-heading-mobile": ["22px", { lineHeight: "1.3" }],
        body: ["18px", { lineHeight: "1.7" }],
        "body-mobile": ["16px", { lineHeight: "1.7" }],
        small: ["13px", { lineHeight: "1.5", letterSpacing: "0.05em" }],
        caption: ["14px", { lineHeight: "1.5" }],
        "nav-link": ["14px", { lineHeight: "1", letterSpacing: "0.05em" }],
      },
      maxWidth: {
        text: "680px",
        image: "900px",
        layout: "1200px",
      },
      spacing: {
        section: "120px",
        "section-mobile": "80px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.25, 0, 0, 1)",
      },
      backdropBlur: {
        nav: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
