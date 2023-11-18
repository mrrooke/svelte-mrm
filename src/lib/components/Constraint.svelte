<svelte:options immutable={true} />

<script lang="ts">
	import { X } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import EditableMF from './EditableMF.svelte';
	import type { ConstraintType } from './types';
	import Button from './ui/button/button.svelte';

	export let constraint: ConstraintType,
		updateConstraint: (constraint: ConstraintType) => void,
		handleMove: (dir: 'up' | 'down') => void,
		handleDelete: (constraint: ConstraintType) => void,
		handleBackspace: (constraint: ConstraintType) => void,
		handleFocus: (constraint: ConstraintType) => void,
		handleBlur: (e: FocusEvent | CustomEvent<FocusEvent>) => void;

	export const setLatex = (latex: string) => mf.latex(latex);

	let focusMF: () => MathQuill.v3.EditableMathQuill;
	let mf: EditableMF;

	onMount(() => {
		if (constraint.active) {
			focusMF();
		}
	});
</script>

<EditableMF
	bind:this={mf}
	bind:focus={focusMF}
	on:delete={() => handleBackspace(constraint)}
	on:down={() => handleMove('down')}
	on:up={() => handleMove('up')}
	on:focus={() => handleFocus(constraint)}
	on:blur={(e) => {
		const edited = constraint.expression !== '';
		handleBlur(e);
		updateConstraint({ ...constraint, edited });
	}}
	on:edit={({ detail }) => {
		if (detail.success) {
			updateConstraint({
				...constraint,
				expression: detail.expression,
				symbols: detail.symbols,
				edited: true,
				err: undefined
			});
		} else {
			updateConstraint({ ...constraint, err: detail.error, expression: '', symbols: [] });
		}
	}}
	on:keydown
/>
{#if constraint.active}
	<Button
		variant="ghost"
		size="icon"
		class="rounded-full"
		on:click={(e) => {
			e.stopPropagation();
			e.preventDefault();
			handleDelete(constraint);
		}}
	>
		<X class="h-4 w-4" />
	</Button>
{/if}
