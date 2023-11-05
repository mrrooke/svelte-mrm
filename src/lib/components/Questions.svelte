<script lang="ts">
	import Katex from './Katex.svelte';

	import { questions } from '$lib/stores/questions';

	// TODO first load specific dialog
	// TODO show specific error messages for why it won't load
	// TODO Katex display mode questions
</script>

<ol class="questions">
	{#each $questions.questions.sort(() => 0.5 - Math.random()).slice(0, 10) as question}
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
	}

	li :global(.katex-display) {
		margin: 0;
	}
</style>
