
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

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
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Fresha Brand Colors
				fresha: {
					purple: 'hsl(var(--fresha-purple))',
					'purple-light': 'hsl(var(--fresha-purple-light))',
					'purple-dark': 'hsl(var(--fresha-purple-dark))',
					gray: 'hsl(var(--fresha-gray))',
					'gray-dark': 'hsl(var(--fresha-gray-dark))',
					success: 'hsl(var(--fresha-success))',
					warning: 'hsl(var(--fresha-warning))',
					error: 'hsl(var(--fresha-error))',
				},
				// Aura Platform Colors
				aura: {
					primary: '#8B5CF6',      // Primary violet
					secondary: '#3B82F6',    // Primary blue  
					accent: '#06B6D4',       // Cyan accent
					success: '#10B981',      // Emerald
					warning: '#F59E0B',      // Amber
					error: '#EF4444',        // Red
					light: '#F8FAFC',        // Light background
					'violet-50': '#F5F3FF',
					'violet-100': '#EDE9FE',
					'violet-200': '#DDD6FE',
					'violet-300': '#C4B5FD',
					'violet-400': '#A78BFA',
					'violet-500': '#8B5CF6',
					'violet-600': '#7C3AED',
					'violet-700': '#6D28D9',
					'violet-800': '#5B21B6',
					'violet-900': '#4C1D95',
					'blue-50': '#EFF6FF',
					'blue-100': '#DBEAFE',
					'blue-200': '#BFDBFE',
					'blue-300': '#93C5FD',
					'blue-400': '#60A5FA',
					'blue-500': '#3B82F6',
					'blue-600': '#2563EB',
					'blue-700': '#1D4ED8',
					'blue-800': '#1E40AF',
					'blue-900': '#1E3A8A',
				}
			},
			fontFamily: {
				sans: ['Inter', 'Noto Sans Arabic', 'sans-serif'],
				arabic: ['Noto Sans Arabic', 'Inter', 'sans-serif'],
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
				},
				'fresha-slide-up': {
					from: {
						transform: 'translateY(10px)',
						opacity: '0'
					},
					to: {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'fresha-scale': {
					from: {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					to: {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'aura-gradient': {
					'0%, 100%': {
						'background-position': '0% 50%'
					},
					'50%': {
						'background-position': '100% 50%'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fresha-slide-up': 'fresha-slide-up 0.3s ease-out',
				'fresha-scale': 'fresha-scale 0.2s ease-out',
				'aura-gradient': 'aura-gradient 15s ease infinite',
			},
			backgroundImage: {
				'aura-gradient': 'linear-gradient(-45deg, #8B5CF6, #3B82F6, #06B6D4, #10B981)',
				'aura-light': 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
			}
		}
	},
        plugins: [animate],
} satisfies Config;
