const {terser} = require('rollup-plugin-terser');
const serve = require('rollup-plugin-serve');

const isDev = process.env.BUILD_ENV === 'dev';

const baseServePlugin = [
	serve({
		// open: true,
		contentBase: ['docs-src', './'],
		port: 3000,
	}),
];

module.exports = [
	// --- Full AnimBase ---
	// ESM
	{
		input: 'src/index.js',
		output: {
			file: 'dist/animbase.esm.js',
			format: 'esm',
			sourcemap: isDev,
		},
	},

	// CJS
	{
		input: 'src/index.js',
		output: {
			file: 'dist/animbase.cjs.js',
			format: 'cjs',
			sourcemap: isDev,
		},
	},

	// IIFE (non-minified)
	{
		input: 'src/index.js',
		output: {
			file: 'dist/animbase.iife.js',
			format: 'iife',
			name: 'AnimBase',
			sourcemap: isDev,
		},
		plugins: isDev ? baseServePlugin : [],
	},

	// IIFE (minified)
	{
		input: 'src/index.js',
		output: {
			file: 'dist/animbase.iife.min.js',
			format: 'iife',
			name: 'AnimBase',
			plugins: [terser()],
			sourcemap: isDev,
		},
	},

	// --- Core-Only Build ---
	{
		input: 'src/animbase-core-only.js',
		output: {
			file: 'dist/animbase-core-only.esm.js',
			format: 'esm',
			sourcemap: isDev,
		},
	},
	{
		input: 'src/animbase-core-only.js',
		output: {
			file: 'dist/animbase-core-only.cjs.js',
			format: 'cjs',
			sourcemap: isDev,
		},
	},
];
