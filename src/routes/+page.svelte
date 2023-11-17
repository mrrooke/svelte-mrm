<script lang="ts">
	import Repl from '$lib/components/Repl.svelte';
	import { questions } from '$lib/stores/questions';
	import { wasm } from '$lib/stores/wasm';
	import type { WasmWorker } from '$lib/worker';
	import MyWorker from '$lib/worker?worker';
	import * as Comlink from 'comlink';
	import { onDestroy, onMount } from 'svelte';

	let loaded = false;

	let myWorker: Worker;

	let obj: Comlink.Remote<WasmWorker>;

	onMount(() => {
		myWorker = new MyWorker();
		obj = Comlink.wrap<WasmWorker>(myWorker);
		$wasm = obj;

		// Load page when WASM is loaded
		myWorker.onmessage = (e) => {
			if (e.data === 'WASM initialized') {
				loaded = true;
				return;
			}
		};
	});

	onDestroy(() => {
		if ($questions.stream) {
			void $questions.stream.cancel();
		}
		if (myWorker) myWorker.terminate();
	});
</script>

<svelte:head>
	<title>mrm</title>
</svelte:head>

<Repl {loaded} />
