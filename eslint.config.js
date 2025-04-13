const {defineConfig} = require('eslint/config');

const prettier = require('eslint-config-prettier');

module.exports = defineConfig([
	{
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'module',
		},
		rules: {
			...prettier.rules,
			semi: 'error',
			'prefer-const': 'warn',
		},
	},
]);
