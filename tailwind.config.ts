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
                background: "#F3F6FD", // Soft light blue/grey
                foreground: "#1A1D1F",
                card: {
                    DEFAULT: "#FFFFFF",
                    foreground: "#1A1D1F",
                },
                primary: {
                    DEFAULT: "#3D5FD9", // A nice active blue
                    foreground: "#FFFFFF",
                },
                muted: {
                    DEFAULT: "#F4F5F7",
                    foreground: "#6F767E",
                },
                accent: {
                    blue: "#E8F0FF",
                    red: "#FFE8E8",
                    green: "#E8FFEB",
                    yellow: "#FFF8E8",
                }
            },
            borderRadius: {
                '3xl': '1.5rem',
                '4xl': '2rem',
            },
            boxShadow: {
                'soft': '0 10px 40px -10px rgba(0,0,0,0.05)',
                'card': '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02)',
            }
        },
    },
    plugins: [],
};
export default config;
