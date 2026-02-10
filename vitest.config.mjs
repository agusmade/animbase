/// <reference types="vitest" />
import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./test/setup.js'],
		coverage: {
			include: ['src/**'],
			exclude: ['docs-src/**', 'tools/**', 'src/index.js', 'src/animbase-core-only.js', '*.js', '*.mjs', '**/*.d.ts'],
		},
	},
});
