<script lang="ts">
	import katex from 'katex';

	export let math: string;
	export let displayMode = false;

	const options = {
		displayMode: displayMode,
		throwOnError: false
	};

	$: katexString = math ? katex.renderToString(math, options) : '';
</script>

{@html katexString}
