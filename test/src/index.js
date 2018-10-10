import svelte from 'svelte';
import VirtualList from '../..';
import { assert, test, done } from 'tape-modern';

// setup
const target = document.querySelector('main');

function indent(node, spaces) {
	if (node.childNodes.length === 0) return;

	if (node.childNodes.length > 1 || node.childNodes[0].nodeType !== 3) {
		const first = node.childNodes[0];
		const last = node.childNodes[node.childNodes.length - 1];

		const head = `\n${spaces}  `;
		const tail = `\n${spaces}`;

		if (first.nodeType === 3) {
			first.data = `${head}${first.data}`;
		} else {
			node.insertBefore(document.createTextNode(head), first);
		}

		if (last.nodeType === 3) {
			last.data = `${last.data}${tail}`;
		} else {
			node.appendChild(document.createTextNode(tail));
		}

		let lastType = null;
		for (let i = 0; i < node.childNodes.length; i += 1) {
			const child = node.childNodes[i];
			if (child.nodeType === 1) {
				indent(node.childNodes[i], `${spaces}  `);

				if (lastType === 1) {
					node.insertBefore(document.createTextNode(head), child);
					i += 1;
				}
			}

			lastType = child.nodeType;
		}
	}
}

function normalize(html) {
	const div = document.createElement('div');
	div.innerHTML = html
		.replace(/<!--.+?-->/g, '')
		.replace(/svelte-ref-\w+/g, '')
		.replace(/\s*svelte-\w+\s*/g, '')
		.replace(/class=""/g, '')
		.replace(/>\s+/g, '>')
		.replace(/\s+</g, '<');

	indent(div, '');

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

	t.equal(div.getElementsByClassName('row').length, 3);

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

test('updates when items change', t => {
	const Row = svelte.create(`
		<div style="height: 80px;">{foo}</div>
	`);

	const list = new VirtualList({
		target,
		data: {
			items: [{ foo: 'bar'}],
			component: Row,
			height: '100px'
		}
	});

	t.htmlEqual(target.innerHTML, `
		<div style='height: 100px;'>
			<div style="padding-top: 0px; padding-bottom: 0px;">
				<div class="row">
					<div style="height: 80px;">bar</div>
				</div>
			</div>
		</div>
	`);

	list.set({
		items: [{ foo: 'bar'}, { foo: 'baz'}, { foo: 'qux'}]
	});

	t.htmlEqual(target.innerHTML, `
		<div style='height: 100px;'>
			<div style="padding-top: 0px; padding-bottom: 80px;">
				<div class="row">
					<div style="height: 80px;">bar</div>
				</div>

				<div class="row">
					<div style="height: 80px;">baz</div>
				</div>
			</div>
		</div>
	`);

	list.destroy();
});

test('updates when items change from an empty list', t => {
	const Row = svelte.create(`
		<div style="height: 80px;">{foo}</div>
	`);

	const list = new VirtualList({
		target,
		data: {
			items: [],
			component: Row,
			height: '100px'
		}
	});

	t.htmlEqual(target.innerHTML, `
		<div style='height: 100px;'>
			<div style="padding-top: 0px; padding-bottom: 0px;"></div>
		</div>
	`);

	list.set({
		items: [{ foo: 'bar'}, { foo: 'baz'}, { foo: 'qux'}]
	});

	t.htmlEqual(target.innerHTML, `
		<div style='height: 100px;'>
			<div style="padding-top: 0px; padding-bottom: 80px;">
				<div class="row">
					<div style="height: 80px;">bar</div>
				</div>

				<div class="row">
					<div style="height: 80px;">baz</div>
				</div>
			</div>
		</div>
	`);

	list.destroy();
});

test('handles unexpected height changes when scrolling up', async t => {
	const Row = svelte.create(`
		<div style="height: {rowHeight}px;">test</div>
	`);

	const list = new VirtualList({
		target,
		data: {
			items: Array(20).fill().map(() => ({})),
			component: Row,
			height: '500px',
			rowHeight: 50
		}
	});

	const { viewport } = list.refs;

	await scroll(viewport, 500);
	assert.equal(viewport.scrollTop, 500);

	list.set({ rowHeight: 100 });
	await scroll(viewport, 475);
	assert.equal(viewport.scrollTop, 525);

	list.destroy();
});

function scroll(element, y) {
	return new Promise(fulfil => {
		element.addEventListener('scroll', function handler() {
			element.removeEventListener('scroll', handler);
			fulfil();
		});

		element.scrollTo(0, y);
	});
}

// this allows us to close puppeteer once tests have completed
window.done = done;