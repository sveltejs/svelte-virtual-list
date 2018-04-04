import VirtualList from '../..';
import { assert, test, done } from 'tape-modern';

// setup
const target = document.querySelector('main');

function normalize(html) {
	const div = document.createElement('div');
	div.innerHTML = html
		.replace(/svelte-ref-\w+=""/g, '')
		.replace(/\s*svelte-\w+\s*/g, '')
		.replace(/class=""/g, '')
		.replace(/>\s+/g, '>')
		.replace(/\s+</g, '<');

	div.normalize();
	return div.innerHTML;
}

assert.htmlEqual = (a, b, msg) => {
	assert.equal(normalize(a), normalize(b));
};

// tests
test('with no data, creates two <div> elements', t => {
	const list = new VirtualList({
		target,
		data: {
			items: [],
			component: null
		}
	});

	t.htmlEqual(target.innerHTML, `
		<div>
			<div style="padding-top: 0px; padding-bottom: 0px;"></div>
		</div>
	`);

	list.destroy();
});

// this allows us to close puppeteer once tests have completed
window.done = done;