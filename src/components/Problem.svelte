<script context="module" lang="ts">
	import type {
		Constraint as ConstraintType,
		Domain,
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
	import { tick } from 'svelte';
	import { onMount, prevent_default } from 'svelte/internal';
	import Tooltip from './Tooltip.svelte';

	export let questions: string[] = [];
	let expression: string;
	let symbols: string[] = [];
	let domains: Domain[] = [];
	let activeDomains: Domain[] = [];
	let focusedConstraint: number | undefined = undefined;
	let constraints: ConstraintType[] = [{ expression: '', id: 0, active: false, err: '' }];
	let err = '';
	let valid: boolean;
	let focusMF: () => void;

	$: newConstraintId = constraints.length ? Math.max(...constraints.map((t) => t.id)) + 1 : 1;
	$: domains = updateDomains(domains, symbols);
	$: valid = err === '' && constraints.reduce((prev, curr) => prev && curr.err === '', true);
	$: if (constraints.slice(-1)[0].active) {
		addConstraint('');
	}
	$: activeDomains = domains.filter((d) => d.active === true);
	$: activeVariables = activeDomains.map((d) => d.variable);

	function handleMoveDown() {
		// TODO use specifically the problem container here
		const mathFields = Array.from(document.querySelectorAll('[aria-label^="Math Input:"]'));
		const idx = mathFields.findIndex((mf) => mf === document.activeElement);
		if (idx < mathFields.length - 1) {
			mathFields[idx + 1].focus();
		} else {
			// end of constraint list so add a new one
			addConstraint('');
		}
	}

	function handleMoveUp() {
		const mathFields = [...document.querySelectorAll('[aria-label^="Math Input:"]')];
		const idx = mathFields.findIndex((mf) => mf === document.activeElement);
		if (idx > 0) {
			mathFields[idx - 1].focus();
		}
	}

	async function handleDelete(constraint: ConstraintType, force: boolean) {
		if (constraint.expression === '' || force) {
			const idx = constraints.findIndex((c) => c.id === constraint.id);
			removeConstraint(constraint);
			await tick();
			const mathFields = document.querySelectorAll('[aria-label^="Math Input:"]');
			if (focusedConstraint === constraint.id) {
				mathFields[idx].focus();
			} else if (focusedConstraint === -1) {
				// only move focus if we are focused on constraint being removed
				mathFields[0].focus();
			} else {
				const focusedIdx = constraints.findIndex((c) => c.id === focusedConstraint);
				mathFields[focusedIdx + 1].focus();
			}
		}
	}

	function handleFocus(constraint: ConstraintType) {
		focusedConstraint = constraint.id;
	}

	function updateDomains(domains: Domain[], symbols: string[]): Domain[] {
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

	function removeDomain(domain: Domain) {
		const idx = domains.findIndex((d) => d.variable === domain.variable);
		domains[idx].active = false;
		domains = domains;
	}

	function generateProblem() {
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
		}
	}

	onMount(() => {
		focusMF();
	});
</script>

<form on:submit|preventDefault={generateProblem} class="problem">
	<Stack space="0">
		<button style="margin-bottom: 3px;" disabled={!valid}>generate</button>
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
			<div class="expression">
				<span class="label"><Katex math={domain.variable} /></span>
				<div class="content">
					<input type="number" bind:value={domain.low} style="width: 3em" />
					<Katex math={`\\leq ${domain.variable}\\leq`} />
					<input type="number" style="width: 3em" bind:value={domain.high} />
					<button
						style="margin-left: auto;align-self: flex-start;"
						on:click|preventDefault={() => removeDomain(domain)}
					>
						<Icon name="x" />
					</button>
				</div>
			</div>
		{/each}
		{#each constraints as constraint, index (constraint.id)}
			<Constraint
				bind:constraint
				focused={focusedConstraint === constraint.id}
				{index}
				variables={activeVariables}
				{handleDelete}
				{handleFocus}
				{handleMoveDown}
				{handleMoveUp}
			/>
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
</style>
