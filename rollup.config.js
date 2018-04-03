import svelte from 'rollup-plugin-svelte';
import pkg from './package.json';

export default {
	input: 'src/index.html',
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
};