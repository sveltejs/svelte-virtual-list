import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';

export default [
	{
		input: 'src/VirtualList.html',
		output: [
			{ file: pkg.module, 'format': 'es' },
			{ file: pkg.main, 'format': 'umd', name: 'VirtualList' }
		],
		plugins: [
			svelte({
				cascade: false,
				store: true
			})
		]
	},

	// tests
	{
		input: 'test/src/index.js',
		output: {
			file: 'test/public/bundle.js',
			format: 'iife'
		},
		plugins: [
			svelte({
				cascade: false,
				store: true
			}),
			resolve()
		]
	}
];