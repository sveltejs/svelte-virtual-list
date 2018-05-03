import svelte from 'svelte';
import VirtualList from '../..';
import { assert, test, done } from 'tape-modern';

// setup
const target = document.querySelector('main');

function normalize(html) {
	const div = document.createElement('div');
	div.innerHTML = html
		.replace(/<!--.+?-->/g, '')
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
		<div style='height: 100%;'>
			<div style="padding-top: 0px; padding-bottom: 0px;"></div>
		</div>
	`);

	list.destroy();
});

test('allows height to be specified', t => {
	const list = new VirtualList({
		target,
		data: {
			items: [],
			component: null,
			height: '150px'
		}
	});

	const div = target.firstElementChild;

	t.equal(getComputedStyle(div).height, '150px');

	list.set({ height: '50%' });
	t.equal(getComputedStyle(div).height, '250px');

	list.destroy();
});

test('allows item height to be specified', t => {
	const Row = svelte.create(`
		<span>{foo}</span>
	`);

	const list = new VirtualList({
		target,
		data: {
			items: [{ foo: 'bar' }, { foo: 'bar' }, { foo: 'bar' }, { foo: 'bar' }],
			component: null,
			height: '150px',
			itemHeight: 100
		}
	});

	const div = target.firstElementChild;

	t.equal(div.getElementsByClassName('row').length, 2);

	list.set({ itemHeight: 50 });

	// TODO, run handleScroll when items or itemHeight is updated? Probably not needed.
	// t.equal(div.getElementsByClassName('row').length, 3);

	list.destroy();
});

test('props are passed to child component', t => {
	const Row = svelte.create(`
		<span>{foo}</span>
		<span>{baz}</span>
		<span>{items}</span> <!-- should be undefined -->
	`);

	const list = new VirtualList({
		target,
		data: {
			items: [{ foo: 'bar'}],
			component: Row,
			baz: 'qux'
		}
	});

	t.htmlEqual(target.innerHTML, `
		<div style='height: 100%;'>
			<div style="padding-top: 0px; padding-bottom: 0px;">
				<div class="row">
					<span>bar</span>
					<span>qux</span>
					<span>undefined</span>
				</div>
			</div>
		</div>
	`);

	list.set({ baz: 'changed' });

	t.htmlEqual(target.innerHTML, `
		<div style='height: 100%;'>
			<div style="padding-top: 0px; padding-bottom: 0px;">
				<div class="row">
					<span>bar</span>
					<span>changed</span>
					<span>undefined</span>
				</div>
			</div>
		</div>
	`);

	list.destroy();
});

// this allows us to close puppeteer once tests have completed
window.done = done;