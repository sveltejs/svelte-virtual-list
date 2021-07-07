declare module "svelte-virtual-list" {
  import { SvelteComponentTyped } from "svelte/types/runtime";

  export interface IProps<T> {
    items: T[];
    height?: string;
    itemHeight?: number;
    start: number;
    end: number;
  }

  export default class VirtualList<T> extends SvelteComponentTyped<IProps<T>> {}
}
