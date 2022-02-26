/* eslint-disable unicorn/prefer-module */

const defaults = require('tailwindcss/defaultTheme');

/** @type {import("tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
	content: ['./src/**/*.{tsx,ts,css}'],
	darkMode: 'media',
	theme: {
		extend: {
			fontFamily: {
				...defaults.fontFamily,
				sans: ['Inter', ...defaults.fontFamily.sans],
			},
		},
	},
	plugins: [],
};
