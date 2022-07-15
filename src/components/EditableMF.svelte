<script lang="ts">
	import MQ from './mq.svelte';

	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	let dispatch = createEventDispatcher();
	let customHandlers: MathQuill.v3.HandlerOptions;
	export let expression = '';
	export let symbols: string[] = [];
	export let err = '';
	export let style = '';
	export let config: MathQuill.v3.Config = {};
	export let handlers: MathQuill.v3.HandlerOptions = {};

	export const focus = () => child.focus();
	export const blur = () => child.blur();

	let child;

	$: customHandlers = {
		...handlers,
		deleteOutOf: (dir, mf) => {
			dispatch('delete', mf);
		},
		downOutOf: (mf) => {
			dispatch('down', mf);
		},
		upOutOf: (mf) => {
			dispatch('up', mf);
		},
		edit: (mf) => {
			expression = mf.latex();
			if (expression == '') {
				symbols = [];
				err = '';
			} else {
				const res = JSON.parse(self.mrm_parse(expression));
				if (res.error) {
					err = res.error;
				} else {
					symbols = res.symbols;
					err = '';
				}
			}
		}
	};
</script>

<div
	class="container"
	{style}
	on:focusin={(e) => dispatch('focus', e)}
	on:focusout={(e) => dispatch('blur', e)}
>
	<MQ bind:this={child} handlers={customHandlers} {config} />
</div>

<style>
	.container {
		width: 100%;
		min-height: 3rem;
		display: flex;
		align-items: center;
	}
</style>
