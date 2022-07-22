<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Integer from './Domains/Integer.svelte';
	import EditableMf from './EditableMF.svelte';
	import Katex from './Katex.svelte';
	import type { DomainType } from './types';

	export let domain: DomainType;

	let dispatch = createEventDispatcher();
</script>

{#if domain.type === 'integer'}
	<Integer {domain} on:down={() => dispatch('down')} on:up={() => dispatch('up')} />
{:else if domain.type === 'discrete'}
	<div class="expression discrete">
		<span class="label">
			<Katex math={domain.variable} />
		</span>
		<div class="content">
			<EditableMf
				on:down={() => dispatch('down')}
				on:up={() => dispatch('up')}
				expression={`${domain.variable}\\in\\left\\{x,y,z\\right\\}`}
			/>
		</div>
	</div>
{:else}
	<p>invalid domain type</p>
{/if}

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
		justify-content: left;
	}
</style>
