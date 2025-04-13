const {terser} = require('rollup-plugin-terser');
const serve = require('rollup-plugin-serve');

// Check if in dev mode via environment variable
const isDev = process.env.BUILD_ENV === 'dev';

/**
 * Shared output options
 */
const makeOutput = (file, format, options = {}) => ({
	file: `dist/${file}`,
	format,
	sourcemap: isDev,
	...options,
});

/**
 * Optional dev server plugin (only active for dev + iife)
 */
const devPlugins = isDev
	? [
			serve({
				contentBase: ['docs-src', './'],
				port: 3000,
			}),
	  ]
	: [];

module.exports = [
	// --- Full AnimBase ---

	// ESM
	{
		input: 'src/index.js',
		output: makeOutput('animbase.esm.js', 'esm'),
	},

	// CJS
	{
		input: 'src/index.js',
		output: makeOutput('animbase.cjs.js', 'cjs'),
	},

	// IIFE (non-minified)
	{
		input: 'src/index.js',
		output: makeOutput('animbase.iife.js', 'iife', {name: 'AnimBase'}),
		plugins: devPlugins,
	},

	// IIFE (minified)
	{
		input: 'src/index.js',
		output: makeOutput('animbase.iife.min.js', 'iife', {
			name: 'AnimBase',
			plugins: [terser()],
		}),
	},

	// --- Core-Only Build ---

	{
		input: 'src/animbase-core-only.js',
		output: makeOutput('animbase-core-only.esm.js', 'esm'),
	},
	{
		input: 'src/animbase-core-only.js',
		output: makeOutput('animbase-core-only.cjs.js', 'cjs'),
	},
];
