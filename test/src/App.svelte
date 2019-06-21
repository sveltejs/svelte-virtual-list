<script>
	import VirtualList from '../../VirtualList.svelte';
	import Row from './Row.svelte';

	export let items = [];
	export let height = '100px';
	export let itemHeight;
</script>

<VirtualList {height} {items} {itemHeight} let:item>
	<Row text={item.text} height={item.height}/>
</VirtualList>