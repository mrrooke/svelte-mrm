<script lang="ts">
	export let element = 'div';
	export let space = 'var(--size-1)';
	export let width = '50%';
	export let right = false;
	export let noStretch = false;
</script>

<svelte:element
	this={element}
	class="sidebar"
	style:--sidebar-space={space}
	style:--sidebar-width={width}
	class:right
	class:no-stretch={noStretch}
>
	<slot />
</svelte:element>

<style>
	.sidebar {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sidebar-space);
	}

	.no-stretch {
		align-items: flex-start;
	}

	.sidebar > :global(*) {
		flex-grow: 1;
		flex-basis: var(--sidebar-width);
	}

	.sidebar > :global(:last-child) {
		flex-basis: 0;
		flex-grow: 999;
		min-width: var(--sidebar-min);
	}

	.right > :global(:first-child) {
		flex-basis: 0;
		flex-grow: 999;
		min-width: var(--sidebar-min);
	}
</style>
