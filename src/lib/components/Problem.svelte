<script lang="ts">
	import EditableMF from './EditableMF.svelte';

	import { onMount, tick } from 'svelte';
	import Constraint from './Constraint.svelte';
	import Domain from './Domain.svelte';

	import {
		ProblemRequest,
		ProblemResponse,
		type ConstraintType,
		type DomainType,
		type ProblemOptionsType
	} from './types';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { questions } from '$lib/stores/questions';
	import { addToast } from '$lib/stores/toasts';
	import { wasm } from '$lib/stores/wasm';
	import { ChevronLeft, Save, X } from 'lucide-svelte';
	import { safeParse } from 'valibot';
	import ExpressionContainer from './ExpressionContainer.svelte';
	import { get_repl_context } from './context';
	import Button from './ui/button/button.svelte';

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
	let err: string | null = null;
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

	const { toggleable, collapsed } = get_repl_context();

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

	$: valid =
		err == null &&
		expression !== '' &&
		constraints.reduce((prev, curr) => prev && curr.err == null, true) &&
		domains.reduce((prev, curr) => prev && curr.err == null, true); // add this to an event

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

	function handleMove(dir: 'up' | 'down') {
		const fields = getFields();
		const idx = fields.findIndex((mf) => mf.el().contains(document.activeElement));
		if (idx < 0 || idx >= fields.length) {
			return;
		}
		const mf = fields[idx + (dir === 'up' ? -1 : 1)];
		if (!mf) return;
		mf.focus();
		mf.select();
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
		if (index === constraints.length - 1) {
			addConstraint('');
		}
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
		if (err == null && expression === '') {
			constraint.err = 'constraints cannot be empty';
		} else if (constraint.err == null) {
			constraint.err = checkVariables(constraintSymbols, symbols);
		}
		const index = constraints.findIndex((c) => c.id === constraint.id);
		constraints[index] = constraint;
		constraints = constraints;
		changed = true;
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
		domains = domains;
		changed = true;
	}

	function removeDomain(domain: DomainType) {
		const idx = domains.findIndex((d) => d.variable === domain.variable);
		const d = domains[idx];
		if (d) {
			d.active = false;
		}
		domains = domains; // trigger reactivity
	}

	// TODO This should be refactored into a store, or just a separate TS file (somehow?
	export async function generateProblem(options: ProblemOptionsType) {
		const problem = safeParse(ProblemRequest, {
			constraints: constraints.filter((c) => c.active === true),
			domains: domains,
			expression,
			options
		});

		if (!problem.success) {
			// TODO handle this better. Likely needs resetting of problem state.
			// I don't even really know how this is reachable.
			console.error(problem.issues);
			return;
		}

		// 0.a If a previous problem set is being generated, cancel it.
		if ($questions.generate) {
			$questions.generate = false; // TODO no idea if this actually cancels the stream
		}

		// 1. Send problem to wasm and get readable stream.
		// TODO can this be refactored to a reset function?
		$questions.changed = false;
		$questions.generate = true;
		$questions.allQuestions = [];
		$questions.questions = [];

		// TODO is there a way to emit a warning after applying unary constraints
		// that there is large domain to check? e.g. 10^10 but 2^10 after pruning is
		// better.
		try {
			$questions.stream = await $wasm.stream(problem.output);
		} catch (e) {
			if (e instanceof Error) {
				addToast(`could not generate questions: ${e.message}`);
			} else {
				addToast(`could not generate questions: unhandled error`);
			}
			// TODO handle this better
			$questions.generate = false;
			return;
		}

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
					const questionStateArray = result.output.questions.map((q) => ({
						question: q,
						answer: 'no answer',
						used: false,
						active: false
					}));
					$questions.allQuestions.push(...questionStateArray);
				}
				if ($questions.delayed && !delayedShown) {
					// After 300ms set the initial questions and show processing message
					questions.pull();
					$questions.changed = true;
					delayedShown = true;
				}
			}
		}

		// 3. Successfully found all solutions, so clear the timeout and show the results.
		clearTimeout(timeoutId);

		// 4. If we didn't set the questions with a delay timeout, set them now.
		if ($questions.questions.length === 0) {
			addToast(`Found ${$questions.allQuestions.length.toLocaleString()} unique questions`);
			questions.pull();
		} else {
			// 4a. If we did set the questions with a delay timeout, indicate that there are more questions.
			addToast(
				`Found ${$questions.allQuestions.length.toLocaleString()} unique questions. 	You may want to refresh to see more.`
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

	$: focusedIndex;
</script>

<div class="overflow-x-hidden overflow-y-auto h-full min-h-0 min-w-0 flex flex-col">
	<div class="flex h-12 px-2.5 flex-nowrap justify-between items-center border-x">
		<Button
			variant="outline"
			class="rounded-full"
			size="icon"
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
			<Save class="h-4 w-4" />
		</Button>
		<div class="flex flex-row gap-4">
			{#if !$toggleable && !$collapsed}
				<Button
					variant="outline"
					class="rounded-full"
					size="icon"
					on:click={() => {
						$collapsed = true;
					}}
				>
					<ChevronLeft class="w-4 h-4" />
				</Button>
			{/if}
		</div>
	</div>
	<div />

	<form
		bind:this={problemContainer}
		on:submit={() => {
			if (valid) {
				void generateProblem(options);
			} else {
				addToast("can't generate questions, please check for any errors.");
			}
		}}
		class="grid grid-rows-[1fr_40px] h-full min-h-0 max-h-full min-w-0 border-x text-lg"
	>
		<div class="overflow-x-hidden overflow-y-auto min-h-0 min-w-0">
			<ExpressionContainer focused={focusedIndex === 0} {err} label="f">
				<EditableMF
					{expression}
					on:down={() => handleMove('down')}
					on:up={() => handleMove('up')}
					on:blur={() => {
						if (edited && expression === '') {
							err = 'expression cannot be empty';
						}
					}}
					on:focus={() => {
						focusedIndex = 0;
						getFields()[focusedIndex]?.select;
					}}
					on:edit={({ detail }) => {
						if (detail.success) {
							expression = detail.expression;
							symbols = detail.symbols;
							domains = updateDomains(domains, symbols);
							constraints.forEach((c) => updateConstraint(c));
							err = null;
							changed = true;
						} else {
							err = detail.error;
						}
					}}
					on:keydown={(e) => {
						if (e.key === 'Enter' && valid) {
							void generateProblem(options);
						}
					}}
					bind:focus={focusMF}
				/>
			</ExpressionContainer>
			{#each domains as domain, index (domain.variable)}
				<ExpressionContainer
					focused={focusedIndex === index + 1}
					err={domain.err}
					label={(index + 1).toLocaleString()}
				>
					<Domain
						bind:domain
						handleFocus={handleDomainFocus}
						{updateDomain}
						on:delete={() => removeDomain(domain)}
						on:up={() => handleMove('up')}
						on:down={() => handleMove('down')}
						on:keydown={(e) => {
							if (e.key === 'Enter' && valid) {
								void generateProblem(options);
							}
						}}
					/>
				</ExpressionContainer>
			{/each}
			{#each constraints as constraint, index (constraint.id)}
				<ExpressionContainer
					focused={focusedIndex === index + domains.length + 1}
					label={constraint.active ? (index + domains.length + 1).toLocaleString() : null}
					err={constraint.err}
				>
					<Constraint
						bind:this={constraintFields[constraint.id]}
						bind:constraint
						on:keydown={(e) => {
							if (e.key === 'Enter' && valid) {
								void generateProblem(options);
							}
						}}
						{updateConstraint}
						{handleBackspace}
						{handleDelete}
						handleFocus={handleConstraintFocus}
						{handleMove}
						{handleBlur}
					/>
				</ExpressionContainer>
			{/each}
		</div>
		<!-- If generating and it is delayed show processing with option to cancel -->
		{#if $questions.generate && $questions.delayed}
			<Button
				class="h-full"
				on:click={() => {
					$questions.generate = false;
				}}
			>
				<span>Processing...</span>
				<X /></Button
			>
		{:else}
			<Button class="h-full" variant="default" type="submit">Generate</Button>
		{/if}
	</form>
</div>
