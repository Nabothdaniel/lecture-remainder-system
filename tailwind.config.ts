import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				sidebar: {
					bg: 'hsl(var(--sidebar-bg))',
					text: 'hsl(var(--sidebar-text))',
					'text-muted': 'hsl(var(--sidebar-text-muted))',
					hover: 'hsl(var(--sidebar-hover))',
					active: 'hsl(var(--sidebar-active))'
				},
				chat: {
					bg: 'hsl(var(--chat-bg))',
					text: 'hsl(var(--chat-text))',
					'text-muted': 'hsl(var(--chat-text-muted))'
				},
				btn: {
					primary: 'hsl(var(--btn-primary))',
					'primary-text': 'hsl(var(--btn-primary-text))',
					secondary: 'hsl(var(--btn-secondary))',
					'secondary-text': 'hsl(var(--btn-secondary-text))'
				},
				input: {
					bg: 'hsl(var(--input-bg))',
					border: 'hsl(var(--input-border))',
					text: 'hsl(var(--input-text))'
				},
				accent: {
					blue: 'hsl(var(--accent-blue))',
					gray: 'hsl(var(--accent-gray))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
