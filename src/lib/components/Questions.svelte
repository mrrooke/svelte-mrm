<script lang="ts">
	import Katex from './Katex.svelte';

	import { questions } from '$lib/stores/questions';
</script>

<ol class="questions">
	{#each $questions.questions as question}
		<li>
			<Katex math={question} fleqn={true} displayMode />
		</li>
	{/each}
</ol>

<style>
	.questions {
		height: 100%;
		font-size: 1rem;
		overflow-y: auto;
		background: var(--bg-default);
	}

	li :global(.katex-display) {
		margin: 0;
	}
</style>
