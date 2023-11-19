<script lang="ts">
	import { ChevronRight } from 'lucide-svelte';
	import { writable } from 'svelte/store';
	import Problem from './Problem.svelte';
	import ProblemQuestionsToggle from './ProblemQuestionsToggle.svelte';
	import Questions from './Questions.svelte';
	import { set_repl_context } from './context';

	export let orientation: 'columns' | 'rows' = 'columns';
	export let loaded = false;

	let contentRect: DOMRectReadOnly | undefined;
	let show_questions = false;

	const toggleable = writable(false);
	const collapsed = writable(false);

	set_repl_context({ toggleable, collapsed });

	$: mobile = contentRect !== undefined && contentRect.width < 540;

	$: $toggleable = mobile && orientation === 'columns';
	$: if ($toggleable && $collapsed) {
		$collapsed = false;
	}
</script>

<div class="relative w-full h-full" class:toggleable={$toggleable} bind:contentRect>
	<div
		class="w-[200%] h-[calc(100%-42px)] md:w-full transition-transform viewport md:h-full flex"
		class:output={show_questions}
	>
		<section class="w-full max-w-full md:w-1/3 md:max-w-1/3">
			{#if loaded}
				{#if $collapsed}
					<div class="collapsed-sidebar">
						<button
							data-variant="secondary"
							on:click={() => {
								$collapsed = false;
							}}
						>
							<ChevronRight />
						</button>
					</div>
				{:else}
					<Problem valid={true} />
				{/if}
			{/if}
		</section>
		<section class="w-full md:w-2/3">
			{#if loaded}
				<Questions />
			{/if}
		</section>
	</div>
	{#if $toggleable}
		<ProblemQuestionsToggle bind:checked={show_questions} />
	{/if}
</div>

<style lang="postcss">
	.toggleable .viewport.output {
		@apply -translate-x-1/2;
	}
</style>
