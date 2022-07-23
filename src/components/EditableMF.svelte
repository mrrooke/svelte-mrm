<script lang="ts">
	// TODO selection colour overlaps (transluscent?) creating weird effect
	import { createEventDispatcher } from 'svelte';
	import { mathquill } from '../actions/useMq';

	let dispatch = createEventDispatcher();
	let dispatchFocus = createEventDispatcher<{ blur: FocusEvent; focus: FocusEvent }>();
	let instance: MathQuill.v3.EditableMathQuill;
	export let expression = '';
	export let symbols: string[] = [];
	export let err: string | undefined = '';
	export let style = '';
	export let config: MathQuill.v3.Config = {};
	export let handlers: MathQuill.v3.HandlerOptions = {};
	export const focus = () => {
		instance.focus();
	};
	export const setLatex = (latex?: string): MathQuill.v3.EditableMathQuill | string => {
		if (latex) {
			return instance.latex(latex);
		} else {
			return instance.latex();
		}
	};

	$: handlers = {
		...handlers,
		deleteOutOf: (_, mf) => {
			dispatch('delete', mf);
		},
		downOutOf: (mf) => {
			dispatch('down', mf);
		},
		upOutOf: (mf) => {
			dispatch('up', mf);
		},
		edit: (mf) => {
			dispatch('edit', mf);
			expression = mf.latex();
			if (expression == '') {
				symbols = [];
				err = undefined;
			} else {
				const res = JSON.parse(self.mrm_parse(expression));
				if (res.error) {
					err = res.error;
				} else {
					symbols = res.symbols;
					err = undefined;
				}
			}
		}
	};

	function getInstance(node: HTMLElement) {
		const MQ = window.MathQuill.getInterface(3) as MathQuill.v3.API;
		const isInstance = MQ(node);
		if (isInstance instanceof MQ.MathField) {
			instance = isInstance as MathQuill.v3.EditableMathQuill;
		}
	}
</script>

<div
	class="container"
	{style}
	on:focusin={(e) => dispatchFocus('focus', e)}
	on:focusout={(e) => dispatchFocus('blur', e)}
>
	<span style="width: 100%;" use:mathquill={{ ...config, handlers }} use:getInstance
		>{expression}</span
	>
</div>

<style>
	.container {
		display: flex;
		width: 100%;
		min-height: 3rem;
		align-items: center;
	}
</style>
