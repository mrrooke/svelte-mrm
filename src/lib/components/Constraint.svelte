<svelte:options immutable={true} />

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import EditableMF from './EditableMF.svelte';
	import IconButton from './IconButton.svelte';
	import type { Constraint } from './types';

	export let constraint: Constraint,
		updateConstraint: (constraint: Constraint) => void,
		handleMoveDown: () => void,
		handleMoveUp: () => void,
		handleDelete: (constraint: Constraint) => void,
		handleBackspace: (constraint: Constraint) => void,
		handleFocus: (constraint: Constraint) => void,
		handleBlur: (e: FocusEvent | CustomEvent<FocusEvent>) => void;

	let expression = '',
		err: string | undefined = undefined,
		symbols: string[] = [],
		focusMF: () => MathQuill.v3.EditableMathQuill;

	$: updateConstraint({ ...constraint, expression, err, symbols });

	onMount(() => {
		if (constraint.active) {
			focusMF();
		}
	});

	// TODO clicking delete blurs the field which triggers error for empty field
</script>

<EditableMF
	bind:expression
	bind:err
	bind:symbols
	bind:focus={focusMF}
	on:delete={() => handleBackspace(constraint)}
	on:down={handleMoveDown}
	on:up={handleMoveUp}
	on:focus={() => handleFocus(constraint)}
	on:blur={(e) => {
		handleBlur(e);
		updateConstraint({ ...constraint, edited: true });
	}}
	on:edit={() => updateConstraint({ ...constraint, edited: true })}
/>
{#if constraint.active}
	<IconButton
		style="flex-shrink: 0;align-self: flex-start;margin-top: 2px; margin-right:2px;margin-left: auto; "
		name="x"
		label="remove domain"
		on:click={(e) => {
			e.stopPropagation();
			e.preventDefault();
			handleDelete(constraint);
		}}
	/>
{/if}
