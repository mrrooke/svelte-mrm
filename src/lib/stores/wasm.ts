import type { WasmWorker } from '$lib/worker';
import type * as Comlink from 'comlink';
import { writable } from 'svelte/store';

export const wasm = writable<Comlink.Remote<WasmWorker>>();
