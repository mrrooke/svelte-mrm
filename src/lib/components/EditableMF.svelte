<script lang="ts">
	// TODO selection colour overlaps (transluscent?) creating weird effect
	import { createEventDispatcher } from 'svelte';
	import { mathquill } from '../actions/useMq';

	let instance: MathQuill.v3.EditableMathQuill;

	let dispatch = createEventDispatcher();
	let dispatchFocus = createEventDispatcher<{ blur: FocusEvent; focus: FocusEvent }>();

	export let expression = '';
	export let symbols: string[] = [];
	export let err: string | undefined = undefined;
	export let style = '';
	export let config: MathQuill.v3.Config = {};
	export let handlers: MathQuill.v3.HandlerOptions = {};

	/**
	 * Puts the focus on the editable field.
	 */
	export const focus = () => instance.focus();

	/**
	 * Removes focus from the editable field.
	 */
	export const blur = () => instance.blur();

	/**
	 * Write the given LaTeX at the current cursor position. If the cursor does not have focus, writes to
	 * last position the cursor occupied in the editable field.
	 * @param str LaTeX string to write
	 */
	export function write(str: string) {
		instance.write(str);
	}

	/**
	 * Enter a LaTeX command at the current cursor position or with the current selection.
	 * If the cursor does not have focus, it writes it to last position the cursor occupied
	 * in the editable field.
	 * @param str LaTeX command to write
	 */
	export const cmd = (str: string) => instance.cmd(str);

	/**
	 * This will render the argument as LaTeX in the MathQuill instance.
	 * @param latex
	 */
	export const latex = (latex: string): MathQuill.v3.EditableMathQuill | string => {
		return instance.latex(latex);
	};

	/**
	 * Selects the contents (just like on textareas and on inputs).
	 */
	export function select() {
		instance.select();
	}

	/**
	 * Clears the selection
	 */
	export function clearSelection() {
		instance.clearSelection();
	}

	export function moveToLeftEnd() {
		instance.moveToLeftEnd();
	}

	export function moveToRightEnd() {
		instance.moveToRightEnd();
	}

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
				// TODO use zod parse here or something
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
		const MQ = self.MathQuill.getInterface(3);
		const isInstance = MQ(node);
		if (isInstance != null) {
			instance = MQ.MathField(node);
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
