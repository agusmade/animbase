const { terser } = require("rollup-plugin-terser");

module.exports = [
	// ESM
	{
		input: "src/index.js",
		output: {
			file: "dist/animbase.esm.js",
			format: "esm",
			sourcemap: true,
		},
	},

	// IIFE (non-minified)
	{
		input: "src/index.js",
		output: {
			file: "dist/animbase.iife.js",
			format: "iife",
			name: "AnimBase",
			sourcemap: true,
		},
	},

	// IIFE (minified)
	{
		input: "src/index.js",
		output: {
			file: "dist/animbase.iife.min.js",
			format: "iife",
			name: "AnimBase",
			plugins: [terser()],
			sourcemap: true,
		},
	},
];
