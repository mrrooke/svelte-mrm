<svelte:options immutable={true} />

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import StaticMf from '../StaticMF.svelte';
	import type { DomainType, IntegerDomainType } from '../types';

	export let domain: IntegerDomainType;
	export let handleFocus: (domain: DomainType) => void;
	export let updateDomain: (domain: DomainType) => void;

	let dispatch = createEventDispatcher();
	let instance: MathQuill.v3.BaseMathQuill | undefined;

	// TODO on focus select text

	function parseNumber(n: string): number | string {
		if (n === '') {
			return 'cannot have an empty value for domain';
		}
		if (n.match(/^-*[0-9]+$/) !== null) {
			const res = parseInt(n, 10);
			if (isNaN(res)) {
				return `could not parse "${n}" as an integer`;
			} else {
				return res;
			}
		} else {
			return `could not parse "${n}" as an integer`;
		}
	}

	function onEditDomain(mf: MathQuill.v3.BaseMathQuill) {
		const el = mf.el();
		const parsedInt = parseNumber(mf.latex());
		if (typeof parsedInt === 'string') {
			// TODO this is fucked
			el.classList.add('invalid');
			el.classList.remove('valid');
			updateDomain({ ...domain, err: parsedInt });
			return;
		}

		if (!instance) return;
		const fields = instance.innerFields;

		if (fields.length === 2) {
			const index = fields.findIndex((e) => e.el() === el);
			// TODO THis is fucked
			el.classList.remove('invalid');
			el.classList.add('valid');
			if (index === 0) {
				let err: undefined | string = undefined;
				if (parsedInt > domain.high) {
					err = `lower limit must be less than ${domain.high}`;
				}
				updateDomain({ ...domain, low: parsedInt, err });
			} else if (index === 1) {
				let err: undefined | string = undefined;
				if (parsedInt < domain.low) {
					err = `upper limit must be greater than ${domain.low}`;
				}
				updateDomain({ ...domain, high: parsedInt, err });
			} else {
				console.error('incorrect index for mathfield');
			}
		} else {
			console.error('incorrect number of math fields for a domain field');
		}
	}
</script>

<div class="content" on:focusin={() => handleFocus(domain)}>
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

<style>
	.content {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		justify-content: left;
	}

	.content :global(.mq-editable-field) {
		min-width: 3ch;
		max-width: 5ch;
		border-bottom: solid 2px var(--slate6);
		transition: 0.2s border-color var(--ease-1);
	}

	.content :global(.mq-editable-field.invalid) {
		border-color: var(--red7);
	}

	.content :global(.mq-editable-field):focus-within {
		border-bottom: solid 2px var(--blue7);
	}

	.content :global(.mq-editable-field):hover {
		border-bottom: solid 2px var(--blue6);
	}

	.content :global(.mq-editable-field.invalid):focus-within {
		border-color: var(--red7);
	}

	.content :global(.mq-editable-field.invalid):hover {
		border-color: var(--red6);
	}
</style>
