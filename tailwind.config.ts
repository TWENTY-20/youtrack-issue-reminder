import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/**/*.{js,jsx,ts,tsx,html}", // Include all your React and HTML files
        "./test/**/*.html",                // Include your test folder if relevant
    ],
    theme: {
        extend: {},
    },
    plugins: [],
} satisfies Config;


