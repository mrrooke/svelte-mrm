<script lang="ts">
	import { staticMathField } from '../actions/useMq';

	export let instance: MathQuill.v3.BaseMathQuill | undefined = undefined;
	export let el: HTMLSpanElement | undefined = undefined;
	export let expression = '';
	export let config: MathQuill.v3.Config | undefined = undefined;

	function getInstance(node: HTMLElement) {
		const MQ = window.MathQuill.getInterface(3);
		const isInstance = MQ(node);
		if (isInstance == null) {
			instance = MQ.StaticMath(node);
		} else if (instance == null) {
			instance = isInstance;
		}
	}

	export function latex(): string | undefined {
		return instance?.latex();
	}
</script>

<div class="flex w-full min-h-[3rem] items-center">
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<span style="width: 100%;" bind:this={el} use:staticMathField={config} use:getInstance on:keydown
		>{expression}</span
	>
</div>
