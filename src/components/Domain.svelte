<script lang="ts">
	import Katex from './Katex.svelte';
	import type { DomainType } from './types';
	import { createEventDispatcher } from 'svelte';
	import Icon from './Icon.svelte';

	export let domain: DomainType;

	let dispatch = createEventDispatcher();

	function handleKeyDown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				dispatch('up');
				break;
			case 'ArrowDown':
				event.preventDefault();
				dispatch('down');
				break;
		}
	}
</script>

<div class="expression">
	<span class="label"><Katex math={domain.variable} /></span>
	<div class="content">
		<input type="number" bind:value={domain.low} style="width: 3em" on:keydown={handleKeyDown} />
		<Katex math={`\\leq ${domain.variable}\\leq`} />
		<input type="number" style="width: 3em" bind:value={domain.high} on:keydown={handleKeyDown} />
		<button
			style="margin-left: auto;align-self: flex-start;"
			on:click|preventDefault={() => dispatch('delete')}
		>
			<Icon name="x" />
		</button>
	</div>
</div>

<style>
	.expression {
		--expression-border-width: var(--border-size-1);
		--expression-border-color: var(--violet3);
		--label-color: var(--violet3);
		display: flex;
		flex-direction: row;
		width: 100%;
		align-items: center;
		gap: 1rem;
		border: var(--expression-border-width) solid var(--expression-border-color);
		cursor: pointer;
		transition: 0.1s box-shadow ease, 0.1s border ease;
	}

	.label {
		padding: var(--size-2);
		background-color: var(--label-color);
		font-size: var(--font-size-1);
		height: 100%;
		width: 60px;
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-right: var(--expression-border-width) solid var(--label-color);
		transition: 0.1s background-color ease;
		user-select: none;
	}

	.content {
		width: 100%;
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: center;
		align-items: center;
	}

	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	input[type='number'] {
		-moz-appearance: textfield;
	}
</style>
