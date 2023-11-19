<script lang="ts">
	import katex from 'katex';

	export let math: string;
	export let displayMode = false;
	export let fleqn = false;

	const options: katex.KatexOptions = {
		displayMode,
		throwOnError: false,
		minRuleThickness: 0.06,
		output: 'mathml',
		fleqn
	};

	$: katexString = math ? katex.renderToString(math, options) : '';
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html katexString}

<style lang="postcss">
	:global(math) {
		math-style: normal;
	}
</style>
