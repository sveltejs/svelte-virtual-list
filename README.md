# svelte-virtual-list ([demo](https://svelte.technology/repl?version=1.60.0&gist=f5a127d9c21f529016d434dcbe405c3f))

A virtual list component for Svelte apps. Instead of rendering all your data, `<VirtualList>` just renders the bits that are visible, keeping your page nice and light.

## Installation

```bash
yarn add @sveltejs/svelte-virtual-list
```


## Usage

```html
<VirtualList items={{things}} component={{RowComponent}} />

<script>
  import VirtualList from '@sveltejs/svelte-virtual-list';
  import RowComponent from './RowComponent.html';

  export default {
    components: { VirtualList },

    data() {
      return {
        things: [
          // these can be any values you like
          { name: 'one', value: 1 },
          { name: 'two', value: 2 },
          { name: 'three', value: 3 },
          // ...
          { name: 'six thousand and ninety-two', value: 6092 }
        ],
        RowComponent
      };
    }
  };
</script>
```

The component constructor you supply to `<VirtualList>` will be instantiated for each visible member of `items`, with the data exposed as `row`:

```html
<!-- RowComponent.html -->
<div>
  <strong>{{row.value}}</strong>
  <span>{{row.name}}</span>
</div>
```


## `start` and `end`

You can track which rows are visible at any given by binding to the `start` and `end` values:

```html
<VirtualList items={{things}} component={{RowComponent}} bind:start bind:end />

<p>showing {{start}}-{{end}} of {{things.length}} rows</p>
```

You can rename them with e.g. `bind:start=a bind:end=b`.


## Configuring webpack

If you're using webpack with [svelte-loader](https://github.com/sveltejs/svelte-loader), make sure that you add `"svelte"` to [`resolve.mainFields`](https://webpack.js.org/configuration/resolve/#resolve-mainfields) in your webpack config. This ensures that webpack imports the uncompiled component (`src/index.html`) rather than the compiled version (`index.mjs`) — this is more efficient.

If you're using Rollup with [rollup-plugin-svelte](https://github.com/rollup/rollup-plugin-svelte), this will happen automatically.


## License

[LIL](LICENSE)
