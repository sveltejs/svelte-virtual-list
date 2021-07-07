import { SvelteComponentTyped } from "svelte";

export interface IVirtualListProps<T> {
  items: T[];
  height?: string;
  itemHeight?: number;
  start?: number;
  end?: number;
}

export interface IVirtualListSlot<T> {
  item: T;
}

export default class VirtualList<T> extends SvelteComponentTyped<
  IVirtualListProps<T>,
  {},
  IVirtualListSlot<T>
> {}
