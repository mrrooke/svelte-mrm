<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Discrete from './Domains/Discrete.svelte';
	import Integer from './Domains/Integer.svelte';
	import type { DomainType } from './types';

	export let domain: DomainType;
	export let handleFocus: (domain: DomainType) => void;
	export let updateDomain: (domain: DomainType) => void;

	let dispatch = createEventDispatcher();
</script>

{#if domain.type === 'integer'}
	<Integer
		{domain}
		on:down={() => dispatch('down')}
		on:up={() => dispatch('up')}
		{handleFocus}
		{updateDomain}
	/>
{:else if domain.type === 'discrete'}
	<Discrete
		{domain}
		on:down={() => dispatch('down')}
		on:up={() => dispatch('up')}
		{handleFocus}
		{updateDomain}
	/>
{:else}
	<p>invalid domain type</p>
{/if}
