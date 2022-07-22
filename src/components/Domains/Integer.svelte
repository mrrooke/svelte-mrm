<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { loop_guard } from 'svelte/internal';
	import Katex from '../Katex.svelte';
	import StaticMf from '../StaticMF.svelte';
	import type { IntegerDomain } from '../types';

	export let domain: IntegerDomain;

	let dispatch = createEventDispatcher();
	let instance: MathQuill.v3.BaseMathQuill | undefined;
	let focused = false;

	function parseNumber(n: string): number | string {
		if (n.match(/^[0-9]+$/) !== null) {
			const res = parseInt(n, 10);
			if (isNaN(res)) {
				return 'could not parse integer';
			} else {
				return res;
			}
		} else {
			return 'could not parse integer';
		}
	}

	function onEditDomain(mf: MathQuill.v3.BaseMathQuill) {
		const el = mf.el();
		const fields = instance?.innerFields;
		if (fields && fields.length === 2) {
			const index = fields.findIndex((e) => e.el() === el);
			if (index === 0) {
				const low = parseNumber(mf.latex());
				if (typeof low === 'string') {
					el.classList.add('invalid');
					el.classList.remove('valid');
				} else {
					el.classList.remove('invalid');
					el.classList.add('valid');
					domain.low === low;
				}
			} else if (index === 1) {
				const high = parseNumber(mf.latex());
				if (typeof high === 'string') {
					el.classList.add('invalid');
					el.classList.remove('valid');
				} else {
					domain.high === high;
					el.classList.add('valid');
					el.classList.remove('invalid');
				}
			} else {
				console.warn('incorrect index for mathfield');
			}
		} else {
			console.warn('incorrect number of math fields for a domain field');
		}
	}
</script>

<div
	class="expression"
	class:focused
	on:focusin={() => (focused = true)}
	on:focusout={() => (focused = false)}
>
	<span
		class="label"
		on:click={() => {
			instance?.innerFields[0].focus();
		}}><Katex math={domain.variable} /></span
	>
	<div class="content">
		<StaticMf
			config={{
				handlers: {
					downOutOf: () => dispatch('down'),
					upOutOf: () => dispatch('up'),
					edit: onEditDomain
				}
			}}
			bind:instance
			expression={`\\MathQuillMathField{${domain.low}}\\leq ${domain.variable}\\leq \\MathQuillMathField{${domain.high}}`}
		/>
	</div>
</div>

<style>
	.expression {
		--expression-border-width: var(--border-size-1);
		--expression-border-color: var(--violet3);
		--label-color: var(--violet3);

		display: flex;
		width: 100%;
		flex-direction: row;
		align-items: center;
		border: var(--expression-border-width) solid var(--expression-border-color);
		gap: 1rem;
		transition: 0.1s box-shadow ease, 0.1s border ease;
	}

	.label {
		display: inline-flex;
		width: 60px;
		height: 100%;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		padding: var(--size-2);
		border-right: var(--expression-border-width) solid var(--label-color);
		background-color: var(--label-color);
		cursor: pointer;
		font-size: var(--font-size-1);
		transition: 0.1s background-color ease;
		user-select: none;
	}

	.focused {
		--label-color: var(--violet5);
		--expression-border-color: var(--violet5);
	}

	.content {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		justify-content: left;
	}

	.expression :global(.mq-editable-field) {
		min-width: 3ch;
		max-width: 5ch;
		border-bottom: solid 2px var(--slate6);
		transition: 0.2s border-color var(--ease-1);
	}

	.expression :global(.mq-editable-field.invalid) {
		border-color: var(--red7);
	}

	.expression :global(.mq-editable-field):focus-within {
		border-bottom: solid 2px var(--blue7);
	}

	.expression :global(.mq-editable-field):hover {
		border-bottom: solid 2px var(--blue6);
	}

	.expression :global(.mq-editable-field.invalid):focus-within {
		border-color: var(--red7);
	}

	.expression :global(.mq-editable-field.invalid):hover {
		border-color: var(--red6);
	}
</style>
