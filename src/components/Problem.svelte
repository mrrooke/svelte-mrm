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
	export let changed: boolean = false;

	let expression: string;
	let symbols: string[] = [];
	let domains: DomainType[] = [];
	let activeDomains: DomainType[] = [];
	let focusedConstraint: number | undefined = undefined;
	let constraints: ConstraintType[] = [{ expression: '', id: 0, active: false, err: '' }];
	let err = '';
	let valid: boolean;
	let focusMF: () => void;
	let problemContainer: HTMLFormElement;

	$: newConstraintId = constraints.length ? Math.max(...constraints.map((t) => t.id)) + 1 : 1;
	$: domains = updateDomains(domains, symbols);
	$: valid = err === '' && constraints.reduce((prev, curr) => prev && curr.err === '', true);
	$: if (constraints.slice(-1)[0].active) {
		addConstraint('');
	}
	$: activeDomains = domains.filter((d) => d.active === true);
	$: activeVariables = activeDomains.map((d) => d.variable);
	$: changed = isChanged(expression, activeDomains, constraints);

	function isChanged(expression, activeDomains, constraints) {
		return true;
	}

	function getFields() {
		return [
			...problemContainer.querySelectorAll(
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
		const focused = focusedConstraint === constraint.id;
		removeConstraint(constraint);
		await tick();
		if (focused) {
			const fields = getFields();
			fields[idx - 1].focus();
		}
	}

	function handleFocus(constraint: ConstraintType) {
		focusedConstraint = constraint.id;
	}

	function updateDomains(domains: DomainType[], symbols: string[]): DomainType[] {
		symbols.map((variable) => {
			const domain = domains.find((d) => d.variable === variable);
			if (domain === undefined) {
				domains.push({ variable, low: -10, high: 10, type: 'integer' });
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

	function addDomain(variable: string) {
		domains = [...domains, { variable, high: 10, low: -10, type: 'integer' }];
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
		} else {
			questions = qs;
			changed = false;
		}
	}

	onMount(() => {
		focusMF();
	});
</script>

<form bind:this={problemContainer} on:submit|preventDefault={generateProblem} class="problem">
	<Stack space="0">
		<div
			class="expression"
			class:active={focusedConstraint === -1}
			class:invalid={err !== ''}
			on:focusin={() => {
				focusedConstraint = -1;
			}}
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

	.content {
		width: 100%;
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: center;
		align-items: center;
	}

	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	input[type='number'] {
		-moz-appearance: textfield;
	}
</style>
