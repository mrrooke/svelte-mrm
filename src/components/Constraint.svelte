<svelte:options immutable={true} />

<script lang="ts">
	import EditableMF from './EditableMF.svelte';
	import type { Constraint } from './types';
	import Icon from './Icon.svelte';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Tooltip from './Tooltip.svelte';

	export let constraint: Constraint;
	export let handleMoveDown: () => void;
	export let handleMoveUp: () => void;
	export let handleDelete: (constraint: Constraint, force: boolean) => void;
	export let handleFocus: (constraint: Constraint) => void;
	export let focused: boolean;
	export let index: number;
	export let variables: string[];

	let expression: string = '';
	let err: string = '';
	let valid: boolean = true;
	let constraintSymbols: string[] = [];
	let undefinedSymbols: string[] = [];

	let focusMF: () => void;
	let blurMF: () => void;

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

	function checkVariables(symbols, vars) {
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
	class:focused
	class:inactive={!constraint.active}
	class:invalid={!valid}
	on:focusin={() => {
		constraint = { ...constraint, active: true };
	}}
>
	<span class="label">
		{#if constraint.active}
			{index + 1}
		{/if}
		{#if !valid}
			<div in:fade>
				<Tooltip label={err}>
					<Icon name="alert-circle" />
				</Tooltip>
			</div>
		{/if}
	</span>
	<EditableMF
		bind:expression
		bind:err
		bind:symbols={constraintSymbols}
		on:delete={(e) => constraint && handleDelete(constraint, false)}
		on:down={handleMoveDown}
		on:up={handleMoveUp}
		on:focus={() => constraint && handleFocus(constraint)}
		bind:focus={focusMF}
		bind:blur={blurMF}
	/>
	{#if constraint.active}
		<button
			style="margin-left: auto;align-self: flex-start;"
			on:click|preventDefault={() => constraint && handleDelete(constraint, true)}
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
	}

	.focused {
		--label-color: var(--violet5);
		--expression-border-color: var(--violet5);
	}

	.inactive {
		--label-color: var(--violet2);
	}

	.focused.invalid {
		--label-color: var(--red5);
		--expression-border-color: var(--red5);
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
</style>
