<script lang="ts">
	import { SplitPane } from '@rich_harris/svelte-split-pane';
	import { writable } from 'svelte/store';
	import Problem from './Problem.svelte';
	import Questions from './Questions.svelte';
	import ProblemQuestionsToggle from './ProblemQuestionsToggle.svelte';
	import { set_repl_context } from './context';
	import { ChevronRight } from 'lucide-svelte';

	export let orientation: 'columns' | 'rows' = 'columns';
	export let loaded = false;

	const fixedPos = '50%';

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

<div class="container" class:toggleable={$toggleable} bind:contentRect>
	<div class="viewport" class:output={show_questions}>
		<SplitPane
			--color="hsl(var(--border))"
			id="main"
			type={'horizontal'}
			pos={mobile ? fixedPos : $collapsed ? '65px' : '30%'}
		>
			<section slot="a" class="panel">
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
			<section slot="b">
				{#if loaded}
					<Questions />
				{/if}
			</section>
		</SplitPane>
	</div>
	{#if $toggleable}
		<ProblemQuestionsToggle bind:checked={show_questions} />
	{/if}
</div>

<style>
	.container {
		background-color: var(--bg-1);
		position: relative;
		width: 100%;
		height: 100%;
	}

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

	.panel {
		box-shadow: var(--shadow-3);
	}

	.collapsed-sidebar {
		height: 3rem;
		display: flex;
		padding-inline: 10px;
		flex-wrap: nowrap;
		align-items: center;
	}
</style>
