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

	import {
		type ConstraintType,
		type DomainType,
		type ProblemOptionsType,
		ProblemRequest,
		ProblemResponse
	} from './types';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { addToast } from '$lib/stores/toasts';
	import { wasm } from '$lib/stores/wasm';
	import { AlertCircle, ArrowLeft, ArrowRight, ChevronLeft, Save, X } from 'lucide-svelte';
	import { safeParse } from 'valibot';
	import { questions } from '$lib/stores/questions';

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

	let options: ProblemOptionsType = {
		collapseNegatives: true,
		lexicalOrder: false,
		multSymbol: '\\cdot',
		negativeParenthesis: true,
		printOneMult: false,
		printZeroAdd: false
	};

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

	export async function generateProblem(options: ProblemOptionsType) {
		// 0. Check if problem is valid. This probably isn't necessary
		const problem = safeParse(ProblemRequest, {
			constraints: constraints.filter((c) => c.active === true),
			domains: domains,
			expression,
			options
		});

		if (!problem.success) {
			// TODO handle this better. Likely needs resetting of problem state.
			console.error(problem.issues);
			return;
		}

		// 0.a If a previous problem set is being generated, cancel it.
		if ($questions.generate) {
			$questions.generate = false; // TODO no idea if this actually cancels the stream
			await tick(); // not sure if this is necessary
		}

		// 1. Send problem to wasm and get readable stream.
		$questions.changed = false;
		$questions.generate = true;
		$questions.allQuestions = [];
		$questions.questions = [];
		$questions.stream = await $wasm.stream(problem.output);

		const reader = $questions.stream.getReader();

		let delayedShown = false; // only process a delay once

		// 1a. If the stream works for more than 300ms, show a processing message.
		const timeoutId = setTimeout(() => {
			$questions.delayed = true;
		}, 300);

		// 2. Until the stream is finished, read from the stream and parse the result..
		while ($questions.generate) {
			const { done, value } = await reader.read();
			if (done) {
				reader.releaseLock();
				break;
			}
			if (value) {
				const result = safeParse(ProblemResponse, JSON.parse(value));
				if (result.success && result.output.success) {
					$questions.allQuestions.push(...result.output.questions);
				}
				if ($questions.delayed && !delayedShown) {
					// After 300ms set the initial questions and show processing message
					$questions.questions = $questions.allQuestions
						.sort(() => 0.5 - Math.random())
						.slice(0, 10);
					$questions.changed = true;
					delayedShown = true;
				}
			}
		}

		// 3. Successfully found all solutions, so clear the timeout and show the results.
		clearTimeout(timeoutId);

		// 4. If we didn't set the questions with a delay timeout, set them now.
		if ($questions.questions.length === 0) {
			addToast(`Found ${$questions.allQuestions.length} unique questions`);
			$questions.questions = $questions.allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
		} else {
			// 4a. If we did set the questions with a delay timeout, indicate that there are more questions.
			addToast(
				`Found ${$questions.allQuestions.length} unique questions\nYou may want to refresh to see more.`
			);
		}

		// 5. Reset question state.
		$questions.changed = true;
		$questions.delayed = false;
		$questions.generate = false;
		$questions.reader = null;
		$questions.stream = null;
		changed = false;
	}

	onMount(() => {
		focusMF();
	});

	// TODO: enter or similar to refresh questions
	// TODO: label alignment shouldn't change with/without tooltip
	const animationDuration = { delay: 500, duration: 500 };
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
	on:submit={() => {
		console.log('submitted form');
		void generateProblem(options);
	}}
	class="problem"
>
	<div class="container">
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
				<div class="number">
					<Katex math="f" />
				</div>
				<div class="error-container">
					{#if err !== undefined}
						<div class="error" in:fade={animationDuration} out:fade={animationDuration}>
							<Tooltip label={err}>
								<AlertCircle stroke={focusedIndex === 0 ? 'currentColor' : 'var(--red11)'} />
							</Tooltip>
						</div>
					{/if}
				</div>
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
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						void generateProblem(options);
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
				<div class="label">
					<div class="number">
						{index + 1}
					</div>
					<div class="error-container">
						{#if invalid}
							<div class="error" in:fade={animationDuration} out:fade={animationDuration}>
								<Tooltip label={domain.err ? domain.err : ''}>
									<AlertCircle
										stroke={focused ? 'currentColor' : 'var(--red11)'}
										strokeWidth="3px"
									/>
								</Tooltip>
							</div>
						{/if}
					</div>
				</div>
				<Domain
					bind:domain
					handleFocus={handleDomainFocus}
					{updateDomain}
					on:delete={() => removeDomain(domain)}
					on:up={handleMoveUp}
					on:down={handleMoveDown}
					on:keydown={(e) => {
						if (e.key === 'Enter') {
							void generateProblem(options);
						}
					}}
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
				<div class="label" class:active={constraint.active}>
					<div class="number">
						{#if constraint.active}
							{index + domains.length + 1}
						{/if}
					</div>
					<div class="error-container">
						{#if invalid}
							<div in:fade={animationDuration} out:fade={animationDuration} class="error">
								<Tooltip label={constraint.err ? constraint.err : ''}>
									<AlertCircle
										strokeWidth="3px"
										stroke={focused ? 'currentColor' : 'var(--red11)'}
									/>
								</Tooltip>
							</div>
						{/if}
					</div>
				</div>
				<Constraint
					bind:this={constraintFields[constraint.id]}
					bind:constraint
					on:keydown={(e) => {
						if (e.key === 'Enter') {
							void generateProblem(options);
						}
					}}
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
	</div>
	<!-- If generating and it is delayed show processing with option to cancel -->
	{#if $questions.generate && $questions.delayed}
		<div>
			Processing...
			<button
				class="ghost-icon"
				on:click={async () => {
					$questions.generate = false;
					await tick();
				}}><X /></button
			>
		</div>
	{:else}
		<button type="submit" disabled={!valid}> Generate </button>
	{/if}
</form>

<style>
	.problem {
		display: grid;
		grid-template-rows: 1fr 48px;
		height: 100%;
		min-height: 0;
	}

	.container {
		overflow: hidden auto;
		height: 100%;
		min-height: 0;
		min-width: 0;
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
			0.5s box-shadow ease,
			0.5s border ease;
		transition-delay: 0.5s;
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
		position: relative;
		width: 60px;
		height: 100%;
		border: none;
		border-right: var(--expression-border-width) solid var(--label-color);
		background-color: var(--label-color);
		font-size: var(--font-size-0);
		padding-left: var(--border-size-1);
		transition:
			0.5s background-color ease,
			0.5s border-color ease;
		transition-delay: 0.5s;
		user-select: none;
		padding-block: var(--size-1);
		padding-inline: var(--size-1);
	}

	.error-container {
		position: absolute;
		inset: 0;
	}

	.error {
		display: grid;
		place-content: center;
		place-items: center;
		height: 100%;
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
