<script lang="ts">
	import { createTooltip, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';

	export let message: string;

	const {
		elements: { trigger, content },
		states: { open }
	} = createTooltip({
		positioning: {
			placement: 'top'
		},
		openDelay: 0,
		closeDelay: 0,
		closeOnPointerDown: false,
		forceVisible: true
	});
</script>

<button type="button" class="trigger" use:melt={$trigger} aria-label="Add">
	<slot />
</button>

{#if $open}
	<div use:melt={$content} transition:fade={{ duration: 100 }} class="content">
		<p>{message}</p>
	</div>
{/if}

<style>
	.content {
		color: hsl(var(--popover-foreground));
		background: hsl(var(--popover));
		border-radius: var(--radius);
		padding-inline: var(--size-3);
		padding-block: var(--size-1);
		border: 1px solid hsl(var(--border));
		font-size: 0.75rem;
	}

	button.trigger {
		--_icon-size: 2.5ch;

		background-color: transparent;
	}
</style>
