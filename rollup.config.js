const {terser} = require('rollup-plugin-terser');

module.exports = [
	// --- Full AnimBase ---
	// ESM
	{
		input: 'src/index.js',
		output: {
			file: 'dist/animbase.esm.js',
			format: 'esm',
			sourcemap: process.env.BUILD_ENV === 'dev',
		},
	},

	// CJS
	{
		input: 'src/index.js',
		output: {
			file: 'dist/animbase.cjs.js',
			format: 'cjs',
			sourcemap: process.env.BUILD_ENV === 'dev',
		},
	},

	// IIFE (non-minified)
	{
		input: 'src/index.js',
		output: {
			file: 'dist/animbase.iife.js',
			format: 'iife',
			name: 'AnimBase',
			sourcemap: process.env.BUILD_ENV === 'dev',
		},
	},

	// IIFE (minified)
	{
		input: 'src/index.js',
		output: {
			file: 'dist/animbase.iife.min.js',
			format: 'iife',
			name: 'AnimBase',
			plugins: [terser()],
			sourcemap: process.env.BUILD_ENV === 'dev',
		},
	},

	// --- Core-Only Build ---
	{
		input: 'src/animbase-core-only.js',
		output: {
			file: 'dist/animbase-core-only.esm.js',
			format: 'esm',
			sourcemap: process.env.BUILD_ENV === 'dev',
		},
	},
	{
		input: 'src/animbase-core-only.js',
		output: {
			file: 'dist/animbase-core-only.cjs.js',
			format: 'cjs',
			sourcemap: process.env.BUILD_ENV === 'dev',
		},
	},
];
