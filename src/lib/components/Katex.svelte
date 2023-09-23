<script lang="ts">
	import katex from 'katex';

	export let math: string;
	export let displayMode = false;
	export let fleqn = false;

	const options = {
		displayMode,
		throwOnError: false,
		fleqn
	};

	$: katexString = math ? katex.renderToString(math, options) : '';
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html katexString}
