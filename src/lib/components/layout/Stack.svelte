<script lang="ts">
	export let element = 'div';
	export let recursive = false;
	export let space = 'var(--size-1)';
	export let style: string | undefined = undefined;
</script>

<svelte:element this={element} class="stack" class:recursive {style} style:--stack-space={space}>
	<slot />
</svelte:element>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.recursive :global(*) + :global(*) {
		margin-top: var(--stack-space);
	}

	.stack > :global(*) + :global(*) {
		margin-top: var(--stack-space);
	}
</style>
