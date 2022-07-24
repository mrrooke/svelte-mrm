<script lang="ts">
	import { staticMathField } from '../actions/useMq';

	export let instance: MathQuill.v3.BaseMathQuill | undefined = undefined;
	export let el: HTMLSpanElement | undefined = undefined;
	export let expression = '';
	export let innerFields: MathQuill.v3.EditableMathQuill[] = [];
	export let config: MathQuill.v3.Config | undefined = undefined;

	function getInstance(node: HTMLElement) {
		const MQ = window.MathQuill.getInterface(3) as MathQuill.v3.API;
		const isInstance = MQ(node);
		if (isInstance instanceof MQ.StaticMath) {
			instance = isInstance as MathQuill.v3.BaseMathQuill;
			innerFields = instance.innerFields;
		}
	}

	export function latex(): string[] {
		if (instance) {
			return instance.innerFields.map((e) => e.latex());
		} else {
			return [];
		}
	}
</script>

<div class="container">
	<span style="width: 100%;" bind:this={el} use:staticMathField={config} use:getInstance
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
