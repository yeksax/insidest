/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				"popover": "#181818",
				"zinc-925": "#0E0E10"
			}
		},
	},
	plugins: [],
};
