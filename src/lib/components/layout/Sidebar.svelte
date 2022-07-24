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
		flex-basis: var(--sidebar-width);
		flex-grow: 1;
	}

	.sidebar > :global(:last-child) {
		min-width: var(--sidebar-min);
		flex-basis: 0;
		flex-grow: 999;
	}

	.right > :global(:first-child) {
		min-width: var(--sidebar-min);
		flex-basis: 0;
		flex-grow: 999;
	}
</style>
