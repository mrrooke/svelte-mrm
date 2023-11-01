<script lang="ts">
	import EditableMF from './EditableMF.svelte';
	import Katex from './Katex.svelte';

	import { onMount, tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';
	import Constraint from './Constraint.svelte';
	import Domain from './Domain.svelte';
	import Tooltip from './Tooltip.svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { addToast } from '$lib/stores/toasts';
	import { AlertCircle, ArrowLeft, ArrowRight, ChevronLeft, Save } from 'lucide-svelte';
	import { array, object, optional, safeParse, string } from 'valibot';
	import type {
		Constraint as ConstraintType,
		DomainType,
		ProblemOptions,
		ProblemRequest
	} from './types';

	export let questions: string[] = [];
	export let changed = false;
	export let valid: boolean;

	let nextConstraintId = 0;
	let expression: string;
	let symbols: string[] = [];
	let domains: DomainType[] = [];
	let focusedIndex: number | undefined = undefined;
	let constraints: ConstraintType[] = [
		{
			expression: '',
			id: nextConstraintId++,
			active: false,
			err: undefined,
			edited: false,
			symbols: []
		}
	];
	let err: string | undefined = undefined;
	let edited = false;
	let focusMF: () => MathQuill.v3.EditableMathQuill;
	let problemContainer: HTMLFormElement;
	let lastFocused: HTMLElement;
	let problemMf: EditableMF;
	let constraintFields: Record<number, Constraint> = {};

	const ProblemSchema = object({
		error: optional(string()),
		questions: optional(array(string()))
	});

	onMount(async () => {
		$page.url.searchParams.has('expression') &&
			problemMf.latex($page.url.searchParams.get('expression')!);
		$page.url.searchParams.has('constraints') &&
			$page.url.searchParams
				.get('constraints')!
				.split(',')
				.forEach((s, i) => {
					const id = nextConstraintId++;
					constraints[i] = {
						active: true,
						edited: false,
						expression: s,
						id,
						symbols: [],
						err: undefined
					};
					constraints = constraints;
					void tick();
					constraintFields[id]?.setLatex(s);
				});

		await tick();
	});

	$: domains = updateDomains(domains, symbols);
	$: valid =
		err === undefined &&
		expression !== '' &&
		constraints.reduce((prev, curr) => prev && curr.err === undefined, true) &&
		domains.reduce((prev, curr) => prev && curr.err === undefined, true);
	$: if (constraints.slice(-1)[0]?.active) {
		addConstraint('');
	}
	$: expression, domains, constraints, (changed = true);
	$: symbols, constraints.forEach((c) => updateConstraint({ ...c }));

	function handleBlur(e: CustomEvent<FocusEvent> | FocusEvent) {
		// TODO there is no way this isn't wrong
		if (e instanceof CustomEvent && e.detail && e.detail.target instanceof HTMLElement) {
			lastFocused = e.detail.target;
		} else if (e instanceof FocusEvent && e.target instanceof HTMLElement) {
			lastFocused = e.target;
		}
	}

	/**
	 * Returns all MathQuill fields in the problem container
	 */
	function getFields() {
		const MQ = window.MathQuill.getInterface(3);

		const mathFields = [
			...problemContainer.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
				'.mq-editable-field'
			)
		];

		return mathFields
			.map((mf) => {
				const isInstance = MQ(mf);
				if (isInstance) {
					return isInstance;
				}
			})
			.filter((t): t is MathQuill.v3.EditableMathQuill => t != null);
	}

	function handleMoveDown() {
		const fields = getFields();
		const idx = fields.findIndex((mf) => mf.el().contains(document.activeElement));
		if (idx < fields.length - 1) {
			const mf = fields[idx + 1];
			mf?.focus();
			mf?.moveToLeftEnd();
		}
		if (idx === fields.length - 2) {
			addConstraint('');
		}
	}

	function handleMoveUp() {
		const fields = getFields();
		const idx = fields.findIndex((mf) => mf.el().contains(document.activeElement));
		if (idx > 0) {
			const mf = fields[idx - 1];
			console.log(mf);
			mf?.focus();
			mf?.moveToRightEnd();
		}
	}

	async function handleBackspace(constraint: ConstraintType) {
		if (constraint.expression === '') {
			const fields = getFields();
			const idx = fields.findIndex((mf) => mf.el().contains(document.activeElement));
			// ensure that a deleted field is not navigable
			fields[idx]?.el().setAttribute('data-delete', 'true');
			removeConstraint(constraint);
			await tick();
			fields[idx - 1]?.focus();
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
			fields[fieldIndex - 1]?.focus();
			fields[fieldIndex - 1]?.focus();
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
						low: 0,
						high: 10,
						type: domainType,
						active: true,
						err: undefined
					});
				} else if (domainType === 'discrete') {
					domains.push({
						variable,
						values: ['x', 'y', 'z'],
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
			{
				expression,
				id: nextConstraintId++,
				active: false,
				err: undefined,
				edited: false,
				symbols: []
			}
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
			constraint.err = 'constraints cannot be empty';
		}
		if (constraint.err === undefined) {
			constraint.err = checkVariables(constraintSymbols, symbols);
		}
		const index = constraints.findIndex((c) => c.id === constraint.id);
		constraints[index] = constraint;
		constraints = [...constraints];
	}

	function checkVariables(constraintSymbols: string[], symbols: string[]): string | undefined {
		// If there are no symbols in the constraint, it is invalid
		if (constraintSymbols.length === 0) {
			return 'constraints must contain at least one variable';
		}
		// If there are symbols in the constraint that are not in the expression, it is invalid
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
		console.log('here');
		const index = domains.findIndex((d) => d.variable === domain.variable);
		domains[index] = domain;
		domains = [...domains];
	}

	function removeDomain(domain: DomainType) {
		const idx = domains.findIndex((d) => d.variable === domain.variable);
		const d = domains[idx];
		if (d) {
			d.active = false;
		}
		domains = domains; // trigger reactivity
	}

	export function generateProblem(options: ProblemOptions) {
		const problem: ProblemRequest = {
			constraints: constraints.filter((c) => c.active === true),
			domains: domains,
			expression,
			options
		};

		const result = safeParse(ProblemSchema, JSON.parse(self.mrm_generate(JSON.stringify(problem))));
		if (!result.success) {
			console.error(result.issues);
			return;
		} else {
			const { error: err, questions: qs } = result.output;
			if (err != null) {
				addToast(err);
				console.error(err);
				return;
			} else if (qs != null) {
				addToast(`Found ${qs.length} unique questions`);
				questions = qs;
				changed = false;
			} else {
				addToast('no questions generated');
				return;
			}
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
	<button
		class="icon-button"
		on:click={async () => {
			const params = new URLSearchParams();
			params.set('expression', expression);
			params.set(
				'constraints',
				constraints
					.filter((c) => c.expression !== '')
					.map((c) => encodeURIComponent(c.expression))
					.join(',')
			);
			if ('clipboard' in navigator) {
				await navigator.clipboard.writeText($page.url.pathname + '?' + params.toString());
				addToast('copied url to clipboard');
			} else {
				addToast('could not copy url to clipboard');
			}
			await goto(`?${params.toString()}`);
		}}
	>
		<Save />
	</button>
	<div class="group">
		<button class="icon-button" on:click={() => addToast('undo not implemented yet')}>
			<ArrowLeft />
		</button>
		<button class="icon-button" on:click={() => addToast('redo not implemented yet')}>
			<ArrowRight />
		</button>
	</div>
	<div class="group">
		<button class="icon-button" on:click={() => addToast('collapse not implemented yet')}>
			<ChevronLeft />
		</button>
	</div>
</div>
<div />

<form
	bind:this={problemContainer}
	on:submit|preventDefault={() =>
		generateProblem({
			collapseNegatives: true,
			lexicalOrder: false,
			multSymbol: '\\cdot',
			negativeParenthesis: true,
			printOneMult: false,
			printZeroAdd: false
		})}
	class="problem"
>
	<div
		class="expression"
		class:focused={focusedIndex === 0}
		class:invalid={focusedIndex === 0 && err !== undefined}
		on:focusin={() => {
			focusedIndex = 0;
		}}
		on:focusout={handleBlur}
	>
		<div class="label">
			<Katex math="f(x)" />
			{#if err !== undefined}
				<Tooltip label={err}>
					<AlertCircle stroke={focusedIndex === 0 ? 'currentColor' : 'var(--red11)'} />
				</Tooltip>
			{/if}
		</div>
		<EditableMF
			bind:expression
			bind:symbols
			bind:err
			on:down={handleMoveDown}
			on:up={handleMoveUp}
			on:blur={() => {
				if (edited && expression === '') {
					err = 'expression cannot be empty';
				}
			}}
			on:edit={() => {
				if (expression !== '') {
					edited = true;
				}
			}}
			bind:this={problemMf}
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
						<AlertCircle stroke={focused ? 'currentColor' : 'var(--red11)'} strokeWidth="3px" />
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
			<button
				class="label"
				on:click|stopPropagation={focusMF}
				on:keydown|stopPropagation={focusMF}
				class:active={constraint.active}
			>
				{#if constraint.active}
					{index + domains.length + 1}
				{/if}
				{#if invalid}
					<div in:fade={{ delay: 100, duration: 200 }}>
						<Tooltip label={constraint.err ? constraint.err : ''}>
							<AlertCircle strokeWidth="3px" stroke={focused ? 'currentColor' : 'var(--red11)'} />
						</Tooltip>
					</div>
				{/if}
			</button>
			<Constraint
				bind:this={constraintFields[constraint.id]}
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

		display: grid;
		grid-template-columns: 60px 1fr 40px;
		align-items: center;
		width: 100%;
		border: var(--expression-border-width) solid var(--expression-border-color);
		cursor: pointer;
		gap: var(--size-2);
		transition:
			0.1s box-shadow ease,
			0.1s border ease;
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
		display: flex;
		flex-direction: column;
		width: 60px;
		height: 100%;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		border: none;
		border-right: var(--expression-border-width) solid var(--label-color);
		background-color: var(--label-color);
		font-size: var(--font-size-1);
		transition: 0.1s background-color ease;
		user-select: none;
	}

	.toolbar {
		display: flex;
		height: var(--size-9);
		flex-wrap: nowrap;
		place-content: center space-between;
		align-items: center;
		padding: var(--size-2);
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
