<script lang="ts">
	import Katex from './Katex.svelte';
	import type { DomainType } from './types';
	import { createEventDispatcher } from 'svelte';
	import IconButton from './IconButton.svelte';

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

		<IconButton
			style="align-self: flex-start;margin-left: auto;"
			name="x"
			label="remove domain"
			on:click={(e) => {
				e.preventDefault();
				dispatch('delete');
			}}
		/>
	</div>
</div>

<style>
	.expression {
		--expression-border-width: var(--border-size-1);
		--expression-border-color: var(--violet3);
		--label-color: var(--violet3);

		display: flex;
		width: 100%;
		flex-direction: row;
		align-items: center;
		border: var(--expression-border-width) solid var(--expression-border-color);
		cursor: pointer;
		gap: 1rem;
		transition: 0.1s box-shadow ease, 0.1s border ease;
	}

	.label {
		display: inline-flex;
		width: 60px;
		height: 100%;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		padding: var(--size-2);
		border-right: var(--expression-border-width) solid var(--label-color);
		background-color: var(--label-color);
		font-size: var(--font-size-1);
		transition: 0.1s background-color ease;
		user-select: none;
	}

	.content {
		display: flex;
		width: 100%;
		flex-flow: row nowrap;
		align-items: center;
		justify-content: center;
	}

	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		margin: 0;
		appearance: none;
	}

	/* Firefox */
	input[type='number'] {
		appearance: textfield;
	}
</style>
