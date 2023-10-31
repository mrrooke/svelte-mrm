<script lang="ts">
	export let logo: string;
	export let home_title = 'Homepage';
</script>

<nav>
	<a data-sveltekit-prefetch href="/" class="home" title={home_title}>
		{logo}
		mrm
	</a>

	<ul>
		<slot name="nav-center" />
	</ul>

	<ul>
		<slot name="nav-right" />
	</ul>
</nav>

<style>
	nav {
		position: fixed;
		z-index: 100;
		display: flex;
		width: 100vw;
		height: var(--nav-h);
		align-items: center;
		justify-content: space-between;
		margin: 0 auto;
		background-color: var(--lo-contrast);
		box-shadow: 0 0 0 1px var(--mauve5);
		padding-inline: var(--size-8);
		user-select: none;
	}

	@media (width <= 768px) {
		nav {
			padding-inline: var(--size-3);
		}
	}

	ul {
		position: relative;
		display: flex;
		gap: var(--size-4);
		width: 100%;
		width: auto;
		padding: 0;
		margin: 0;
		list-style: none;
	}

	.home {
		display: flex;
		height: var(--nav-h);
	}
</style>
