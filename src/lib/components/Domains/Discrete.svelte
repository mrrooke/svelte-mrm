<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import StaticMf from '../StaticMF.svelte';
	import type { DiscreteDomain, DomainType } from '../types';

	export let domain: DiscreteDomain;
	export let handleFocus: (domain: DomainType) => void;
	export let updateDomain: (domain: DomainType) => void;

	let dispatch = createEventDispatcher();
	let instance: MathQuill.v3.BaseMathQuill | undefined;

	function onEditDomain() {
		if (!instance) return;
		const fields = instance.innerFields;
		if (fields.length === 1 && fields[0]) {
			const values = fields[0].latex().split(',');
			// TODO no checking here for valid values - mad
			updateDomain({ ...domain, values });
		} else {
			console.warn('incorrect number of math fields for a domain field');
		}
	}
</script>

<div
	aria-hidden="true"
	class="content"
	on:focusin={() => handleFocus(domain)}
	on:click={() => {
		console.log('click');
		if (instance?.innerFields[0]) {
			instance?.innerFields[0].focus();
		}
	}}
>
	<StaticMf
		config={{
			handlers: {
				downOutOf: () => {
					dispatch('down');
				},
				upOutOf: () => dispatch('up'),
				edit: onEditDomain
			}
		}}
		bind:instance
		expression={`${domain.variable}\\in\\left\\{\\MathQuillMathField{x,y,z}\\right\\}`}
	/>
</div>

<style>
	.content {
		width: 100%;
		cursor: pointer;
	}
</style>
