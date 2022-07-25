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

	import { tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import { onMount } from 'svelte/internal';
	import { fade, scale } from 'svelte/transition';
	import Constraint from './Constraint.svelte';
	import Domain from './Domain.svelte';
	import IconButton from './IconButton.svelte';
	import Tooltip from './Tooltip.svelte';

	export let questions: string[] = [];
	export let changed = false;
	export let valid: boolean;

	let expression: string;
	let symbols: string[] = [];
	let domains: DomainType[] = [];
	let focusedIndex: number | undefined = undefined;
	let constraints: ConstraintType[] = [
		{ expression: '', id: 0, active: false, err: undefined, edited: false, symbols: [] }
	];
	let err: string | undefined = undefined;
	let focusMF: () => MathQuill.v3.EditableMathQuill;
	let problemContainer: HTMLFormElement;
	let lastFocused: HTMLElement;

	$: newConstraintId = constraints.length ? Math.max(...constraints.map((t) => t.id)) + 1 : 1;
	$: domains = updateDomains(domains, symbols);
	$: valid =
		err === undefined &&
		expression !== '' &&
		constraints.reduce((prev, curr) => prev && curr.err === undefined, true) &&
		domains.reduce((prev, curr) => prev && curr.err === undefined, true);
	$: if (constraints.slice(-1)[0].active) {
		addConstraint('');
	}
	$: expression, domains, constraints, (changed = true);

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
				'[aria-label^="Math Input:"]:not([data-delete])'
			)
		];
	}

	function handleMoveDown() {
		const fields = getFields();
		const idx = fields.findIndex((mf) => mf === document.activeElement);
		if (idx < fields.length - 1) {
			fields[idx + 1].focus();
		}
		if (idx === fields.length - 2) {
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
		// TODO this is fragile if the number of math fields changes for a domain.
		// will need to be made more robust in the future.
		const index = constraints.findIndex((c) => c.id === constraint.id);
		const focused = index + domains.length + 1 === focusedIndex;
		const fields = getFields();
		const fieldIndex =
			1 +
			domains.filter((d) => d.type === 'integer').length * 2 +
			domains.filter((d) => d.type === 'discrete').length +
			index;

		removeConstraint(constraint);
		await tick();
		if (focused) {
			fields[fieldIndex - 1].focus();
		} else {
			lastFocused.focus();
		}
	}

	function handleConstraintFocus(constraint: ConstraintType) {
		updateConstraint({ ...constraint, active: true });
		const index = constraints.findIndex((c) => c.id === constraint.id);
		focusedIndex = 1 + domains.length + index;
	}

	function handleDomainFocus(domain: DomainType) {
		const index = domains.findIndex((c) => c.variable === domain.variable);
		focusedIndex = 1 + index;
	}

	function updateDomains(domains: DomainType[], symbols: string[]): DomainType[] {
		symbols.map((variable) => {
			const domain = domains.find((d) => d.variable === variable);
			if (domain === undefined) {
				const domainType = variable <= 'd' ? 'integer' : 'discrete';
				if (domainType === 'integer') {
					domains.push({
						variable,
						low: -10,
						high: 10,
						type: domainType,
						active: true,
						err: undefined
					});
				} else if (domainType === 'discrete') {
					domains.push({
						variable,
						symbols: ['x', 'y', 'z'],
						type: domainType,
						active: true,
						err: undefined
					});
				}
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
		constraints = [
			...constraints,
			{ expression, id: newConstraintId, active: false, err: undefined, edited: false, symbols: [] }
		];
	}

	function removeConstraint(constraint: ConstraintType) {
		constraints = constraints.filter((c) => c.id !== constraint.id);
	}

	function updateConstraint(constraint: ConstraintType) {
		const { active, expression, symbols: constraintSymbols, err } = constraint;
		if (!active) {
			return;
		}
		if (err === undefined && expression === '') {
			constraint.err = 'cannot have an empty expression';
		}
		if (constraint.err === undefined) {
			constraint.err = checkVariables(constraintSymbols, symbols);
		}
		const index = constraints.findIndex((c) => c.id === constraint.id);
		constraints[index] = constraint;
		constraints = [...constraints];
	}

	function checkVariables(constraintSymbols: string[], symbols: string[]): string | undefined {
		const undefinedSymbols: string[] = [];
		constraintSymbols.forEach((s) => {
			if (!symbols.includes(s)) {
				undefinedSymbols.push(s);
			}
		});
		if (undefinedSymbols.length > 0) {
			return `Variables ${undefinedSymbols.toString()} need to be defined in a domain`;
		} else {
			return undefined;
		}
	}

	function updateDomain(domain: DomainType) {
		const index = domains.findIndex((d) => d.variable === domain.variable);
		domains[index] = domain;
		domains = [...domains];
	}

	function removeDomain(domain: DomainType) {
		const idx = domains.findIndex((d) => d.variable === domain.variable);
		domains[idx].active = false;
		domains = domains;
	}

	export function generateProblem() {
		const problem: ProblemRequest = {
			constraints: constraints.filter((c) => c.active === true),
			// TODO when discrete domains are implemented remove this filter
			domains: domains.filter((d) => d.type === 'integer'),
			expression,
			options: {
				collapseNegatives: true,
				lexicalOrder: false,
				multSymbol: '\\times',
				negativeParenthesis: true,
				printOneMult: true,
				printZeroAdd: true
			}
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

	// TODO: a long expression will break out of the sidebar
	// TODO: enter or similar to refresh questions
	// TODO: label alignment shouldn't change with/without tooltip
</script>

<div class="toolbar">
	<IconButton name="plus" label="add expression" />
	<div class="group">
		<IconButton name="arrow-left" label="undo" />
		<IconButton name="arrow-right" label="redo" />
	</div>
	<div class="group">
		<IconButton name="settings" label="setting" />
		<IconButton name="chevrons-left" label="collapse sidebar" />
	</div>
</div>
<form bind:this={problemContainer} on:submit|preventDefault={generateProblem} class="problem">
	<div
		class="expression"
		class:focused={focusedIndex === 0}
		class:invalid={focusedIndex === 0 && err !== undefined}
		on:focusin={() => {
			focusedIndex = 0;
		}}
		on:focusout={handleBlur}
	>
		<span class="label">
			<Katex math="f(x)" />
			{#if err !== undefined}
				<Tooltip label={err}>
					<Icon
						name="alert-circle"
						stroke={focusedIndex === 0 ? 'currentColor' : 'var(--red11)'}
						strokeWidth="3px"
					/>
				</Tooltip>
			{/if}
		</span>
		<EditableMF
			bind:expression
			bind:symbols
			bind:err
			on:down={handleMoveDown}
			on:up={handleMoveUp}
			on:blur={() => {
				if (expression === '') {
					err = 'expression cannot be empty';
				}
			}}
			bind:focus={focusMF}
		/>
	</div>
	{#each domains as domain, index (domain.variable)}
		{@const invalid = domain.err !== undefined}
		{@const focused = focusedIndex === index + 1}
		<div class="expression" class:focused class:invalid={focused && invalid}>
			<span class="label">
				{index + 1}
				{#if invalid}
					<Tooltip label={domain.err ? domain.err : ''}>
						<Icon
							name="alert-circle"
							stroke={focused ? 'currentColor' : 'var(--red11)'}
							strokeWidth="3px"
						/>
					</Tooltip>
				{/if}
			</span>
			<Domain
				bind:domain
				handleFocus={handleDomainFocus}
				{updateDomain}
				on:delete={() => removeDomain(domain)}
				on:up={handleMoveUp}
				on:down={handleMoveDown}
			/>
		</div>
	{/each}
	{#each constraints as constraint, index (constraint.id)}
		{@const invalid = constraint.edited && constraint.err !== undefined}
		{@const focused = focusedIndex === index + domains.length + 1}

		<div
			class="expression"
			class:focused
			class:invalid={focused && invalid}
			animate:flip={{ duration: 200 }}
			out:scale={{ duration: 600, easing: quintOut }}
		>
			<span class="label" on:click|stopPropagation={focusMF} class:active={constraint.active}>
				{#if constraint.active}
					{index + domains.length + 1}
				{/if}
				{#if invalid}
					<div in:fade={{ delay: 100, duration: 200 }}>
						<Tooltip label={constraint.err ? constraint.err : ''}>
							<Icon
								name="alert-circle"
								strokeWidth="3px"
								stroke={focused ? 'currentColor' : 'var(--red11)'}
							/>
						</Tooltip>
					</div>
				{/if}
			</span>
			<Constraint
				bind:constraint
				{updateConstraint}
				{handleBackspace}
				{handleDelete}
				handleFocus={handleConstraintFocus}
				{handleMoveDown}
				{handleMoveUp}
				{handleBlur}
			/>
		</div>
	{/each}
</form>

<style>
	.problem {
		display: grid;
		height: 100%;
		grid-auto-rows: min-content;
		overflow-y: auto;
	}

	.expression {
		--expression-border-width: var(--border-size-1);
		--expression-border-color: var(--violet3);
		--label-color: var(--violet3);

		display: flex;
		width: 100%;
		flex-direction: row;
		align-items: center;
		border: var(--expression-border-width) solid var(--expression-border-color);
		cursor: pointer;
		gap: 1rem;
		transition: 0.1s box-shadow ease, 0.1s border ease;
	}

	.focused {
		--label-color: var(--violet5);
		--expression-border-color: var(--violet5);
	}

	.invalid {
		--label-color: var(--red5);
		--expression-border-color: var(--red5);
	}

	.label {
		display: inline-flex;
		width: 60px;
		height: 100%;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		border-right: var(--expression-border-width) solid var(--label-color);
		background-color: var(--label-color);
		font-size: var(--font-size-1);
		transition: 0.1s background-color ease;
		user-select: none;
	}

	.toolbar {
		display: flex;
		height: var(--size-8);
		flex-wrap: nowrap;
		align-content: center;
		align-items: center;
		justify-content: space-between;
		padding: var(--size-1);
		border-top: solid 1px var(--mauve6);
		border-right: solid 1px var(--mauve6);
		border-bottom: solid 1px var(--mauve6);
		background-color: var(--mauve2);
	}

	.group {
		display: flex;
		flex-direction: row;
		gap: var(--size-2);
	}
</style>
