<script context="module" lang="ts">
	import type {
		Constraint as ConstraintType,
		DomainType,
		ProblemRequest,
		ProblemResponse
	} from './types';
</script>

<script lang="ts">
	import EditableMF from './EditableMF.svelte';
	import Icon from './Icon.svelte';
	import Katex from './Katex.svelte';
	import Stack from './layout/Stack.svelte';

	import Constraint from './Constraint.svelte';
	import Domain from './Domain.svelte';
	import { tick } from 'svelte';
	import { onMount } from 'svelte/internal';
	import { flip } from 'svelte/animate';
	import Tooltip from './Tooltip.svelte';

	export let questions: string[] = [];
	export let changed = false;
	export let valid;

	let expression: string;
	let symbols: string[] = [];
	let domains: DomainType[] = [];
	let activeDomains: DomainType[] = [];
	let focusedConstraint: number | undefined = undefined;
	let constraints: ConstraintType[] = [{ expression: '', id: 0, active: false, err: '' }];
	let err = '';
	let focusMF: () => MathQuill.v3.EditableMathQuill;
	let problemContainer: HTMLFormElement;
	let lastFocused: HTMLElement;

	$: newConstraintId = constraints.length ? Math.max(...constraints.map((t) => t.id)) + 1 : 1;
	$: domains = updateDomains(domains, symbols);
	$: valid = err === '' && constraints.reduce((prev, curr) => prev && curr.err === '', true);
	$: if (constraints.slice(-1)[0].active) {
		addConstraint('');
	}
	$: activeDomains = domains.filter((d) => d.active === true);
	$: activeVariables = activeDomains.map((d) => d.variable);
	$: expression,
		activeDomains,
		constraints,
		() => {
			changed = true;
		};

	function handleBlur(e: CustomEvent<FocusEvent> | FocusEvent) {
		if (e instanceof CustomEvent<FocusEvent>) {
			if (e.detail && e.detail.target instanceof HTMLElement) {
				lastFocused = e.detail.target;
			}
		} else if (e instanceof FocusEvent && e.target instanceof HTMLElement) {
			lastFocused = e.target;
		}
	}

	function getFields() {
		return [
			...problemContainer.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
				'[aria-label^="Math Input:"]:not([data-delete]),input[type=number]'
			)
		];
	}

	function handleMoveDown() {
		const fields = getFields();
		const idx = fields.findIndex((mf) => mf === document.activeElement);
		if (idx < fields.length - 1) {
			fields[idx + 1].focus();
		} else {
			// end of constraint list so add a new one
			addConstraint('');
		}
	}

	function handleMoveUp() {
		const fields = getFields();
		const idx = fields.findIndex((mf) => mf === document.activeElement);
		if (idx > 0) {
			fields[idx - 1].focus();
		}
	}

	async function handleBackspace(constraint: ConstraintType) {
		if (constraint.expression === '') {
			const fields = getFields();
			const idx = fields.findIndex((mf) => mf === document.activeElement);
			// ensure that a deleted field is not navigable
			fields[idx].setAttribute('data-delete', 'true');
			removeConstraint(constraint);
			await tick();
			fields[idx - 1].focus();
		}
	}

	async function handleDelete(constraint: ConstraintType) {
		const focused = constraint.id === focusedConstraint;
		const fields = getFields();
		const idx = constraints.findIndex((c) => c.id === constraint.id);
		removeConstraint(constraint);
		await tick();
		if (focused) {
			const len = 1 + activeDomains.length;
			fields[len + idx - 1].focus();
		} else {
			lastFocused.focus();
		}
	}

	function handleFocus(constraint: ConstraintType) {
		focusedConstraint = constraint.id;
	}

	function updateDomains(domains: DomainType[], symbols: string[]): DomainType[] {
		symbols.map((variable) => {
			const domain = domains.find((d) => d.variable === variable);
			if (domain === undefined) {
				domains.push({ variable, low: -10, high: 10, type: 'integer', active: false });
				domains.sort((a, b) => a.variable.localeCompare(b.variable));
			}
		});
		domains.map((domain) => {
			if (!symbols.includes(domain.variable)) {
				domains = domains.filter((d) => d.variable !== domain.variable);
			}
		});
		return domains;
	}

	function addConstraint(expression: string) {
		constraints = [...constraints, { expression, id: newConstraintId, active: false, err: '' }];
	}

	function removeConstraint(constraint: ConstraintType) {
		constraints = constraints.filter((c) => c.id !== constraint.id);
	}

	function removeDomain(domain: DomainType) {
		const idx = domains.findIndex((d) => d.variable === domain.variable);
		domains[idx].active = false;
		domains = domains;
	}

	export function generateProblem() {
		const problem: ProblemRequest = {
			constraints: constraints.filter((c) => c.active === true),
			domains: activeDomains,
			expression
		};
		const result: ProblemResponse = JSON.parse(self.mrm_generate(JSON.stringify(problem)));
		const { error: err, questions: qs } = result;
		if (err !== undefined) {
			console.warn(err);
			return;
		} else if (qs !== undefined) {
			questions = qs;
			changed = false;
		} else {
			console.warn('no questions generated');
		}
	}

	onMount(() => {
		focusMF();
	});
</script>

<p>{focusedConstraint}</p>
<div style="display:flex; flex-wrap: nowrap; justify-content: space-between; align-content: center">
	<Icon name="plus" />
	<Icon name="arrow-left" />
	<Icon name="arrow-right" />
	<Icon name="settings" />
	<Icon name="chevrons-left" />
</div>
<form bind:this={problemContainer} on:submit|preventDefault={generateProblem} class="problem">
	<Stack space="0">
		<div
			class="expression"
			class:active={focusedConstraint === -1}
			class:invalid={err !== ''}
			on:focusin={() => {
				focusedConstraint = -1;
			}}
			on:focusout={handleBlur}
		>
			<span class="label">
				<Katex math="f(x)" />
				{#if err !== ''}
					<Tooltip label={err}>
						<Icon name="alert-circle" />
					</Tooltip>
				{/if}
			</span>
			<EditableMF
				bind:expression
				bind:symbols
				bind:err
				on:down={handleMoveDown}
				on:up={handleMoveUp}
				bind:focus={focusMF}
			/>
			<div style="display: flex; align-items: center">
				{#each domains as domain}
					<label>
						<Katex math={domain.variable} />
						<input type="checkbox" bind:checked={domain.active} />
					</label>
				{/each}
			</div>
		</div>
		{#each activeDomains as domain (domain.variable)}
			<Domain
				bind:domain
				on:delete={() => removeDomain(domain)}
				on:up={handleMoveUp}
				on:down={handleMoveDown}
			/>
		{/each}
		{#each constraints as constraint, index (constraint.id)}
			<div animate:flip={{ duration: 200 }}>
				<Constraint
					bind:constraint
					focused={focusedConstraint === constraint.id}
					{index}
					variables={activeVariables}
					{handleBackspace}
					{handleDelete}
					{handleFocus}
					{handleMoveDown}
					{handleMoveUp}
					{handleBlur}
				/>
			</div>
		{/each}
	</Stack>
</form>

<style>
	.problem {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

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

	.active {
		--label-color: var(--violet5);
		--expression-border-color: var(--violet5);
	}

	.invalid {
		--label-color: var(--red5);
		--expression-border-color: var(--red5);
	}

	.label {
		padding: var(--size-2);
		background-color: var(--label-color);
		font-size: var(--font-size-1);
		height: 100%;
		width: 60px;
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-right: var(--expression-border-width) solid var(--label-color);
		transition: 0.1s background-color ease;
		user-select: none;
	}

	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
