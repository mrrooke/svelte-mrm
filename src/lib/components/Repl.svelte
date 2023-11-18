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

	$: mobile = contentRect != null && contentRect.width < 540;

	$: $toggleable = mobile && orientation === 'columns';
	$: if ($toggleable && $collapsed) {
		$collapsed = false;
	}
</script>

<div class="relative w-full h-full" class:toggleable={$toggleable} bind:contentRect>
	<div class="h-full flex" class:output={show_questions}>
		<section class="w-1/3 max-w-1/3">
			{#if loaded}
				{#if $collapsed}
					<div class="collapsed-sidebar">
						<button
							data-variant="secondary"
							on:click={() => {
								$collapsed = false;
							}}><ChevronRight /></button
						>
					</div>
				{:else}
					<Problem valid={true} />
				{/if}
			{/if}
		</section>
		<section class="w-2/3">
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
	.viewport {
		height: 100%;
	}

	.toggleable .viewport {
		width: 200%;
		height: calc(100% - 42px);
		transition: transform 0.3s;
	}

	.toggleable .viewport.output {
		transform: translate(-50%);
	}

	.collapsed-sidebar {
		height: 3rem;
		display: flex;
		padding-inline: 10px;
		flex-wrap: nowrap;
		align-items: center;
	}
</style>
