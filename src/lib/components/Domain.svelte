<script lang="ts">
	import Discrete from './Domains/Discrete.svelte';
	import Integer from './Domains/Integer.svelte';
	import type { DomainType } from './types';

	export let domain: DomainType;
	export let handleFocus: (domain: DomainType) => void;
	export let updateDomain: (domain: DomainType) => void;
</script>

{#if domain.type === 'integer'}
	<Integer on:keydown {domain} {handleFocus} {updateDomain} on:down on:up />
{:else if domain.type === 'discrete'}
	<Discrete on:keydown {domain} {handleFocus} {updateDomain} on:down on:up />
{:else}
	<p>invalid domain type</p>
{/if}
