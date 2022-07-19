<svelte:options immutable={true} />

<script lang="ts">
	import EditableMF from './EditableMF.svelte';
	import type { Constraint } from './types';
	import Icon from './Icon.svelte';
	import { scale, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Tooltip from './Tooltip.svelte';
	import { quintOut } from 'svelte/easing';

	export let constraint: Constraint;
	export let handleMoveDown: () => void;
	export let handleMoveUp: () => void;
	export let handleDelete: (constraint: Constraint) => void;
	export let handleBackspace: (constraint: Constraint) => void;
	export let handleFocus: (constraint: Constraint) => void;
	export let handleBlur: (e: FocusEvent | CustomEvent<FocusEvent>) => void;
	export let focused: boolean;
	export let index: number;
	export let variables: string[];

	let expression = '';
	let err = '';
	let valid = true;
	let constraintSymbols: string[] = [];
	let undefinedSymbols: string[] = [];
	let focusMF: () => MathQuill.v3.EditableMathQuill;

	function updateConstraint(expr: string, e: string, active: boolean) {
		if (!active) {
			return;
		}
		if (expr === '') {
			err = 'cannot have an empty expression';
			constraint = { ...constraint, expression, err };
			valid = false;
			return;
		}
		if (e !== '') {
			valid = false;
			constraint = { ...constraint, err: e, expression: expr };
			return;
		}
		constraint = { ...constraint, err: '', expression: expr };
		valid = true;
	}

	function checkVariables(symbols: string[], vars: string[]) {
		undefinedSymbols = [];
		symbols.forEach((s) => {
			if (!vars.includes(s)) {
				undefinedSymbols.push(s);
			}
		});
		if (undefinedSymbols.length > 0) {
			err = `Variables ${undefinedSymbols.toString()} need to be defined in a domain`;
			valid = false;
		} else {
			valid = true;
		}
	}

	$: updateConstraint(expression, err, constraint.active);
	$: checkVariables(constraintSymbols, variables);

	onMount(() => {
		if (constraint.active) {
			focusMF();
		}
	});
</script>

<div
	class="expression"
	out:scale={{ duration: 600, easing: quintOut }}
	class:focused
	class:inactive={!constraint.active}
	on:focusin={() => {
		constraint = { ...constraint, active: true };
	}}
	on:click|stopPropagation={focusMF}
>
	<span class="label" on:click|stopPropagation={focusMF}>
		{#if constraint.active}
			{index + 1}
		{/if}
		{#if !valid}
			<div in:fade={{ delay: 100, duration: 200 }} class:invalid={!valid}>
				<Tooltip label={err}>
					<Icon
						name="alert-circle"
						strokeWidth="3px"
						stroke={focused ? 'currentColor' : 'var(--red11)'}
					/>
				</Tooltip>
			</div>
		{/if}
	</span>
	<EditableMF
		bind:expression
		bind:err
		bind:symbols={constraintSymbols}
		bind:focus={focusMF}
		on:delete={() => constraint && handleBackspace(constraint)}
		on:down={handleMoveDown}
		on:up={handleMoveUp}
		on:focus={() => constraint && handleFocus(constraint)}
		on:blur={handleBlur}
	/>
	{#if constraint.active}
		<button
			style="margin-left: auto;align-self: flex-start;"
			on:click|preventDefault|stopPropagation={() => constraint && handleDelete(constraint)}
		>
			<Icon name="x" />
		</button>
	{/if}
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
		height: 100%;
	}

	.focused {
		--label-color: var(--violet5);
		--expression-border-color: var(--violet5);
	}

	.inactive {
		--label-color: var(--violet2);
	}

	.label {
		padding: var(--size-2);
		background-color: var(--label-color);
		font-size: var(--font-size-0);
		height: 100%;
		width: 60px;
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		border-right: var(--expression-border-width) solid var(--label-color);
		transition: 0.1s background-color ease;
		user-select: none;
		align-self: flex-start;
	}

	.invalid {
		color: var(--red11);
	}
</style>
