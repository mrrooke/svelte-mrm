<script context="module" lang="ts">
	declare class Go {
		argv: string[];
		env: { [envKey: string]: string };
		exit: (code: number) => void;
		importObject: WebAssembly.Imports;
		exited: boolean;
		mem: DataView;

		run(instance: WebAssembly.Instance): Promise<void>;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Problem from '../components/Problem.svelte';
	import { browser } from '$app/env';
	import Questions from '../components/Questions.svelte';

	let questions: string[] = [];
	let activeQuestions: string[];
	let width = browser ? window.innerWidth : 1000;
	let offset = false;
	let generateProblem: () => void;
	let changed: boolean = true;
	let valid: boolean = false;

	$: activeQuestions = questions.sort(() => 0.5 - Math.random()).slice(0, 40);
	$: mobile = width < 768;

	onMount(() => {
		const go = new Go();
		WebAssembly.instantiateStreaming(fetch('./main.wasm'), go.importObject).then((result) => {
			go.run(result.instance);
		});
	});
</script>

<svelte:head>
	<title>mrm</title>
</svelte:head>

<svelte:window bind:innerWidth={width} />

<div class="outer">
	<div class="viewport" class:offset>
		<div class="constraints">
			<Problem bind:questions bind:valid bind:generateProblem bind:changed />
		</div>
		<div class="questions">
			<Questions
				bind:changed
				bind:valid
				generate={generateProblem}
				bind:questions={activeQuestions}
			/>
		</div>
	</div>
	{#if mobile}
		<div class="toggle">
			<button class:selected={!offset} on:click={() => (offset = false)} disabled={!offset}>
				constraints</button
			>
			<button class:selected={offset} on:click={() => (offset = true)} disabled={offset}>
				questions</button
			>
		</div>
	{/if}
</div>

<style>
	.outer {
		position: relative;
		height: calc(100vh - var(--nav-h));
		overflow: hidden;
		padding-block-end: var(--size-8);
		box-sizing: border-box;
	}

	.viewport {
		display: grid;
		width: 200%;
		height: 100%;
		grid-template-columns: 1fr 1fr;
		transition: transform 0.3s;
		grid-auto-rows: 100%;
	}

	.offset {
		transform: translate(-50%, 0);
	}

	@media (min-width: 768px) {
		.outer {
			padding: 0;
		}

		.viewport {
			width: 100%;
			height: 100%;
			display: grid;
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
		padding-block-start: var(--size-3);
	}

	.questions {
		padding-block-start: var(--size-3);
		position: relative;
	}

	.toggle {
		position: fixed;
		bottom: 0;
		width: 100%;
		display: flex;
		height: var(--size-8);
		justify-content: center;
		align-items: center;
		border-top: 1px solid var(--slate6);
	}
</style>
