<script lang="ts">
	import { staticMathField } from '../actions/useMq';
	import EditableMf from './EditableMF.svelte';

	let instance: MathQuill.v3.BaseMathQuill;
	let el: HTMLSpanElement;
	export let expression = '';
	$: console.log(el);

	function getInstance(node: HTMLElement) {
		const MQ = window.MathQuill.getInterface(3) as MathQuill.v3.API;
		const isInstance = MQ(node);
		console.log(isInstance);
		if (isInstance instanceof MQ.MathField) {
			instance = isInstance as MathQuill.v3.BaseMathQuill;
			console.log(instance);
		}
	}

	export function innerFields(): string[] {
		if (instance) {
			return instance.innerFields.map((e) => e.latex());
		} else {
			return [];
		}
	}
</script>

<div class="container">
	<span style="width: 100%;" bind:this={el} use:staticMathField use:getInstance>{expression}</span>
</div>

<style>
	.container {
		display: flex;
		width: 100%;
		min-height: 3rem;
		align-items: center;
	}
</style>
