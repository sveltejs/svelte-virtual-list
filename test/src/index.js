import App from './App.svelte';
import { normalize, sleep } from './utils.js';
import { assert, test, done } from 'tape-modern';

// setup
const target = document.querySelector('main');

assert.htmlEqual = (a, b, msg) => {
	assert.equal(normalize(a), normalize(b), msg);
};

// tests
test('with no data, creates two <div> elements', async t => {
	const app = new App({
		target
	});

	t.htmlEqual(target.innerHTML, `
		<svelte-virtual-list-viewport style="height: 100px;">
			<svelte-virtual-list-contents style="padding-top: 0px; padding-bottom: 0px;"></svelte-virtual-list-contents>
		</svelte-virtual-list-viewport>
	`);

	app.$destroy();
});

test('allows height to be specified', async t => {
	const app = new App({
		target,
		props: {
			height: '150px'
		}
	});

	const el = target.firstElementChild;

	t.equal(getComputedStyle(el).height, '150px');

	app.height = '50%';
	t.equal(getComputedStyle(el).height, '250px');

	app.$destroy();
});

test('allows item height to be specified', async t => {
	const app = new App({
		target,
		props: {
			items: [{ text: 'bar' }, { text: 'bar' }, { text: 'bar' }, { text: 'bar' }],
			height: '150px',
			itemHeight: 100
		}
	});

	const el = target.firstElementChild;

	await sleep(1);
	t.equal(el.getElementsByTagName('svelte-virtual-list-row').length, 2);

	app.itemHeight = 50;

	await sleep(1);
	t.equal(el.getElementsByTagName('svelte-virtual-list-row').length, 3);

	app.$destroy();
});

test('updates when items change', async t => {
	const app = new App({
		target,
		props: {
			items: [{ text: 'bar'}],
			height: '100px'
		}
	});

	await sleep(1);

	t.htmlEqual(target.innerHTML, `
		<svelte-virtual-list-viewport style='height: 100px;'>
			<svelte-virtual-list-contents style="padding-top: 0px; padding-bottom: 0px;">
				<svelte-virtual-list-row>
					<div style="height: 80px;">bar</div>
				</svelte-virtual-list-row>
			</svelte-virtual-list-contents>
		</svelte-virtual-list-viewport>
	`);

	app.items = [{ text: 'bar'}, { text: 'baz'}, { text: 'qux'}];

	await sleep(1);

	t.htmlEqual(target.innerHTML, `
		<svelte-virtual-list-viewport style='height: 100px;'>
			<svelte-virtual-list-contents style="padding-top: 0px; padding-bottom: 80px;">
				<svelte-virtual-list-row>
					<div style="height: 80px;">bar</div>
				</svelte-virtual-list-row>

				<svelte-virtual-list-row>
					<div style="height: 80px;">baz</div>
				</svelte-virtual-list-row>
			</svelte-virtual-list-contents>
		</svelte-virtual-list-viewport>
	`);

	app.$destroy();
});

test('updates when items change from an empty list', async t => {
	const app = new App({
		target,
		props: {
			items: [],
			height: '100px'
		}
	});

	await sleep(1);

	t.htmlEqual(target.innerHTML, `
		<svelte-virtual-list-viewport style='height: 100px;'>
			<svelte-virtual-list-contents style="padding-top: 0px; padding-bottom: 0px;"></svelte-virtual-list-contents>
		</svelte-virtual-list-viewport>
	`);

	app.items = [{ text: 'bar'}, { text: 'baz'}, { text: 'qux'}];
	await sleep(1);

	t.htmlEqual(target.innerHTML, `
		<svelte-virtual-list-viewport style='height: 100px;'>
			<svelte-virtual-list-contents style="padding-top: 0px; padding-bottom: 80px;">
				<svelte-virtual-list-row>
					<div style="height: 80px;">bar</div>
				</svelte-virtual-list-row>

				<svelte-virtual-list-row>
					<div style="height: 80px;">baz</div>
				</svelte-virtual-list-row>
			</svelte-virtual-list-contents>
		</svelte-virtual-list-viewport>
	`);

	app.$destroy();
});

test('handles unexpected height changes when scrolling up', async t => {
	const app = new App({
		target,
		props: {
			items: Array(20).fill().map(() => ({ height: 50 })),
			height: '500px'
		}
	});

	await sleep(1);

	const viewport = target.querySelector('svelte-virtual-list-viewport');

	await scroll(viewport, 500);
	assert.equal(viewport.scrollTop, 500);

	app.items = Array(20).fill().map(() => ({ height: 100 }));
	await scroll(viewport, 475);
	assert.equal(viewport.scrollTop, 525);

	app.$destroy();
});

// This doesn't seem to work inside puppeteer...
test.skip('handles viewport resizes', async t => {
	target.style.height = '50px';

	const app = new App({
		target,
		props: {
			items: [{ foo: 'bar'}, { foo: 'baz'}, { foo: 'qux'}],
			height: '100%'
		}
	});

	t.htmlEqual(target.innerHTML, `
		<svelte-virtual-list-viewport style='height: 100%;'>
			<svelte-virtual-list-contents style="padding-top: 0px; padding-bottom: 160px;">
				<svelte-virtual-list-row>
					<div style="height: 80px;">bar</div>
				</svelte-virtual-list-row>
			</svelte-virtual-list-contents>
		</svelte-virtual-list-viewport>
	`);

	target.style.height = '200px';

	t.htmlEqual(target.innerHTML, `
		<svelte-virtual-list-viewport style='height: 100%;'>
			<svelte-virtual-list-contents style="padding-top: 0px; padding-bottom: 0px;">
				<svelte-virtual-list-row>
					<div style="height: 80px;">bar</div>
				</svelte-virtual-list-row>

				<svelte-virtual-list-row>
					<div style="height: 80px;">baz</div>
				</svelte-virtual-list-row>

				<svelte-virtual-list-row>
					<div style="height: 80px;">qux</div>
				</svelte-virtual-list-row>
			</svelte-virtual-list-contents>
		</svelte-virtual-list-viewport>
	`);

	app.$destroy();
});

function scroll(element, y) {
	if (!element || !element.addEventListener) {
		throw new Error('???');
	}

	return new Promise(fulfil => {
		element.addEventListener('scroll', function handler() {
			element.removeEventListener('scroll', handler);
			fulfil();
		});

		element.scrollTo(0, y);

		setTimeout(fulfil, 100);
	});
}

// this allows us to close puppeteer once tests have completed
window.done = done;