import { getContext, setContext } from 'svelte';
import type { Writable } from 'svelte/store';

const key = Symbol('repl');

export interface ReplContext {
	/** toggleable indicates whether we are in the mobile view  */
	toggleable: Writable<boolean>;
	/** collapsed indicates whether the problem panel is collapsed */
	collapsed: Writable<boolean>;
}

export function get_repl_context() {
	return getContext<ReplContext>(key);
}

export function set_repl_context(value: ReplContext) {
	setContext<ReplContext>(key, value);
}
