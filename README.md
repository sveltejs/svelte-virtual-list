# svelte-virtual-list ([demo](https://svelte.technology/repl?version=2&gist=f5a127d9c21f529016d434dcbe405c3f))

A virtual list component for Svelte apps. Instead of rendering all your data, `<VirtualList>` just renders the bits that are visible, keeping your page nice and light.

## Installation

```bash
yarn add @sveltejs/svelte-virtual-list
```


## Usage

```html
<VirtualList items={things} component={RowComponent} />

<script>
  import VirtualList from '@sveltejs/svelte-virtual-list';
  import RowComponent from './RowComponent.html';

  export default {
    components: { VirtualList },

    data() {
      return {
        things: [
          // these can be any values you like
          { name: 'one', number: 1 },
          { name: 'two', number: 2 },
          { name: 'three', number: 3 },
          // ...
          { name: 'six thousand and ninety-two', number: 6092 }
        ],
        RowComponent
      };
    }
  };
</script>
```

The component constructor you supply to `<VirtualList>` will be instantiated for each visible member of `items`:

```html
<!-- RowComponent.html -->
<div>
  <strong>{number}</strong>
  <span>{name}</span>
</div>
```


## `start` and `end`

You can track which rows are visible at any given by binding to the `start` and `end` values:

```html
<VirtualList items={things} component={RowComponent} bind:start bind:end />

<p>showing {start}-{end} of {things.length} rows</p>
```

You can rename them with e.g. `bind:start=a bind:end=b`.


## `itemHeight`

You can optimize initial display and scrolling when the height of items is known in advance.

```html
<VirtualList items={things} component={RowComponent} itemHeight={48} />
```


## Additional properties

You can add arbitrary properties to `<VirtualList>` and they will be forwarded to the rows:

```html
<VirtualList class="funky" answer={42} items={things} component={RowComponent} />
```

```html
<!-- RowComponent.html -->
<div class="{number === answer ? 'the-answer' : ''}">
  <strong>{number}</strong>
  <span>{name}</span>
</div>
```


## Configuring webpack

If you're using webpack with [svelte-loader](https://github.com/sveltejs/svelte-loader), make sure that you add `"svelte"` to [`resolve.mainFields`](https://webpack.js.org/configuration/resolve/#resolve-mainfields) in your webpack config. This ensures that webpack imports the uncompiled component (`src/index.html`) rather than the compiled version (`index.mjs`) — this is more efficient.

If you're using Rollup with [rollup-plugin-svelte](https://github.com/rollup/rollup-plugin-svelte), this will happen automatically.


## License

[LIL](LICENSE)
