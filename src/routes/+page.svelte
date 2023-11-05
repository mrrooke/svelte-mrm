<script lang="ts">
	import { browser } from '$app/environment';
	import Button from '$lib/components/Button.svelte';
	import Problem from '$lib/components/Problem.svelte';
	import Questions from '$lib/components/Questions.svelte';
	import Toasts from '$lib/components/toasts.svelte';
	import type { ProblemOptionsType } from '$lib/components/types';
	import { questions } from '$lib/stores/questions';
	import { wasm } from '$lib/stores/wasm';
	import type { WasmWorker } from '$lib/worker';
	import MyWorker from '$lib/worker?worker';
	import * as Comlink from 'comlink';
	import { onDestroy, onMount } from 'svelte';

	let width = browser ? window.innerWidth : 1000;
	let offset = false;
	let generateProblem: (options: ProblemOptionsType) => Promise<void>;
	let changed = true;
	let valid = false;

	$: mobile = width < 768;

	let isLoaded = false;

	let myWorker: Worker;

	let obj: Comlink.Remote<WasmWorker>;

	onMount(() => {
		myWorker = new MyWorker();
		obj = Comlink.wrap<WasmWorker>(myWorker);
		$wasm = obj;

		// Load page when WASM is loaded
		myWorker.onmessage = (e) => {
			if (e.data === 'WASM initialized') {
				isLoaded = true;
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

<svelte:window bind:innerWidth={width} />

<div class="outer">
	<div class="viewport" class:offset>
		<div class="constraints">
			{#if isLoaded}
				<Problem bind:valid bind:generateProblem bind:changed />
			{/if}
		</div>
		<div class="questions">
			{#if isLoaded}
				<Questions />
			{/if}
		</div>
	</div>
	{#if mobile}
		<div class="toggle">
			<Button on:click={() => (offset = false)} disabled={!offset}>constraints</Button>
			<Button on:click={() => (offset = true)} disabled={offset}>questions</Button>
		</div>
	{/if}
</div>

<Toasts />

<style>
	.outer {
		position: relative;
		overflow: hidden;
		height: calc(100vh - var(--nav-h));
		box-sizing: border-box;
		padding-block-end: var(--size-8);
	}

	.viewport {
		display: grid;
		width: 200%;
		height: 100%;
		grid-auto-rows: 100%;
		grid-template-columns: 1fr 1fr;
		transition: transform 0.3s;
	}

	.offset {
		transform: translate(-50%, 0);
	}

	@media (width >= 768px) {
		.outer {
			padding: 0;
		}

		.viewport {
			display: grid;
			width: 100%;
			height: 100%;
			grid: minmax(0, 1fr) / minmax(30%, 35%) 1fr;
			transition: none;
		}

		.offset {
			transform: none;
		}
	}

	.constraints {
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--slate6);
		box-shadow: 0 -4px 6px var(--shadow-light);
	}

	.questions {
		position: relative;
		padding-block-start: var(--size-3);
	}

	.toggle {
		position: fixed;
		bottom: 0;
		display: flex;
		width: 100%;
		height: var(--size-8);
		align-items: center;
		justify-content: center;
		border-top: 1px solid var(--slate6);
	}
</style>
