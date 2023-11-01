<script>
	import { slide } from 'svelte/transition';
	import { toasts } from '../stores/toasts';
</script>

<section class="group">
	{#each $toasts as toast}
		<output class="toast" transition:slide>
			{toast.message}
		</output>
	{/each}
</section>

<style>
	.group {
		display: grid;
		gap: var(--size-2);
		inset-block-end: 0;
		inset-inline: 0;
		justify-content: center;
		justify-items: center;
		padding-block-end: 5vh;
		pointer-events: none;
		position: fixed;
		z-index: var(--layer-1);
	}

	.toast {
		background: var(--surface-2);
		border-radius: var(--radius-round);
		font-weight: var(--font-weight-4);
		max-inline-size: min(35ch, 90vw);
		padding-block: var(--size-2);
		padding-inline: var(--size-3);
		will-change: transform;
	}
</style>
