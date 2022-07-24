<svelte:options immutable={true} />

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import StaticMf from '../StaticMF.svelte';
	import type { DomainType, IntegerDomain } from '../types';

	export let domain: IntegerDomain;
	export let handleFocus: (domain: DomainType) => void;
	export let updateDomain: (domain: DomainType) => void;

	let dispatch = createEventDispatcher();
	let instance: MathQuill.v3.BaseMathQuill | undefined;

	$: validate(domain);

	function validate(domain: IntegerDomain) {
		if (domain.low >= domain.high) {
			updateDomain({ ...domain, err: 'invalid bounds' });
		}
	}

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
					updateDomain({ ...domain, err: low });
				} else {
					el.classList.remove('invalid');
					el.classList.add('valid');
					updateDomain({ ...domain, low });
				}
			} else if (index === 1) {
				const high = parseNumber(mf.latex());
				if (typeof high === 'string') {
					el.classList.add('invalid');
					el.classList.remove('valid');
					updateDomain({ ...domain, err: high });
				} else {
					updateDomain({ ...domain, high });
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

	// TODO deleteoutof takes to previous mf but doesn't delete
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
