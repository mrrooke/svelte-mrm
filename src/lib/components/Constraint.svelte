<svelte:options immutable={true} />

<script lang="ts">
	import { X } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import EditableMF from './EditableMF.svelte';
	import type { Constraint } from './types';

	export let constraint: Constraint,
		updateConstraint: (constraint: Constraint) => void,
		handleMoveDown: () => void,
		handleMoveUp: () => void,
		handleDelete: (constraint: Constraint) => void,
		handleBackspace: (constraint: Constraint) => void,
		handleFocus: (constraint: Constraint) => void,
		handleBlur: (e: FocusEvent | CustomEvent<FocusEvent>) => void;

	export const setLatex = (latex: string) => mf.latex(latex);

	let expression = '',
		err: string | undefined = undefined,
		symbols: string[] = [];

	let focusMF: () => MathQuill.v3.EditableMathQuill;
	let mf: EditableMF;

	$: updateConstraint({ ...constraint, expression, err, symbols });

	onMount(() => {
		if (constraint.active) {
			focusMF();
		}
	});
</script>

<EditableMF
	bind:this={mf}
	bind:expression
	bind:err
	bind:symbols
	bind:focus={focusMF}
	on:delete={() => handleBackspace(constraint)}
	on:down={handleMoveDown}
	on:up={handleMoveUp}
	on:focus={() => handleFocus(constraint)}
	on:blur={(e) => {
		const edited = constraint.expression !== '';
		handleBlur(e);
		updateConstraint({ ...constraint, edited });
	}}
	on:edit={() => updateConstraint({ ...constraint, edited: true })}
/>
{#if constraint.active}
	<button
		class="icon-button close"
		on:click={(e) => {
			e.stopPropagation();
			e.preventDefault();
			handleDelete(constraint);
		}}
	>
		<X />
	</button>
{/if}
