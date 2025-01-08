import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            keyframes: {
                "progress-bar": {
                    "0%": { width: "0%", left: "-100%" },
                    "100%": { width: "100%", left: "100%" },
                },
            },
            animation: {
                "progress-bar": "progress-bar 2s linear infinite",
            }
        },
    },
    plugins: [],
} satisfies Config;
