<script lang="ts">
	import { onMount } from 'svelte';

	let mq: HTMLElement;
	let instance: MathQuill.v3.EditableMathQuill;
	export let config: MathQuill.v3.Config = {};
	export let handlers: MathQuill.v3.HandlerOptions = {};

	export const focus = () => instance.focus();
	export const blur = () => instance.blur();

	const defaultConfig: MathQuill.v3.Config = {
		spaceBehavesLikeTab: true,
		leftRightIntoCmdGoes: 'up',
		restrictMismatchedBrackets: true,
		sumStartsWithNEquals: true,
		supSubsRequireOperand: true,
		charsThatBreakOutOfSupSub: '+-=<>',
		autoSubscriptNumerals: true,
		autoCommands: 'pi theta sqrt sum in notin neq',
		autoOperatorNames: 'sin cos tan',
		maxDepth: 10
	};

	onMount(() => {
		let customConfig = {
			...defaultConfig,
			...config,
			handlers
		};
		// TODO should declare mathquill on window
		const MQ = window.MathQuill.getInterface(3) as MathQuill.v3.API;
		instance = MQ.MathField(mq, customConfig);
	});
</script>

<span style="width: 100%;" bind:this={mq} />
