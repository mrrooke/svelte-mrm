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
	import { browser } from '$app/environment';
	import Button from '$lib/components/Button.svelte';
	import Problem from '$lib/components/Problem.svelte';
	import Questions from '$lib/components/Questions.svelte';
	import type { ProblemOptions } from '$lib/components/types';
	import { onMount } from 'svelte';

	let questions: string[] = [];
	let activeQuestions: string[];
	let width = browser ? window.innerWidth : 1000;
	let offset = false;
	let generateProblem: (options: ProblemOptions) => void;
	let changed = true;
	let valid = false;
	let options: ProblemOptions = {
		collapseNegatives: true,
		lexicalOrder: false,
		multSymbol: '\\cdot',
		negativeParenthesis: true,
		printOneMult: false,
		printZeroAdd: false
	};

	$: activeQuestions = questions.sort(() => 0.5 - Math.random()).slice(0, 10);
	$: mobile = width < 768;

	onMount(async () => {
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
			<Problem bind:questions bind:valid bind:generateProblem bind:changed bind:options />
		</div>
		<div class="questions">
			<Questions
				bind:changed
				{valid}
				generate={() => generateProblem(options)}
				bind:questions={activeQuestions}
			/>
		</div>
	</div>
	{#if mobile}
		<div class="toggle">
			<Button on:click={() => (offset = false)} disabled={!offset}>constraints</Button>
			<Button on:click={() => (offset = true)} disabled={offset}>questions</Button>
		</div>
	{/if}
</div>

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

	@media (min-width: 768px) {
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
