<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import StaticMf from '../StaticMF.svelte';
	import type { DiscreteDomain, DomainType } from '../types';

	export let domain: DiscreteDomain;
	export let handleFocus: (domain: DomainType) => void;
	export let updateDomain: (domain: DomainType) => void;

	let dispatch = createEventDispatcher();
	let instance: MathQuill.v3.BaseMathQuill | undefined;

	function onEditDomain(_: MathQuill.v3.BaseMathQuill) {
		const fields = instance?.innerFields;
		if (fields && fields.length === 1) {
			const symbols = fields[0].latex().split(',');
			updateDomain({ ...domain, symbols });
		} else {
			console.warn('incorrect number of math fields for a domain field');
		}
	}

	// TODO click on label to select field
	// TODO click on MF selects editable region
	// TODO delete out of takes to previous field
</script>

<div class="content" on:focusin={() => handleFocus(domain)}>
	<StaticMf
		config={{
			handlers: {
				downOutOf: () => dispatch('down'),
				upOutOf: () => dispatch('up'),
				edit: onEditDomain
			}
		}}
		bind:instance
		expression={`${domain.variable}\\in\\left\\{\\MathQuillMathField{x,y,z}\\right\\}`}
	/>
</div>
