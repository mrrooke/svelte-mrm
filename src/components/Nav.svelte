<script lang="ts">
	export let logo: string;
	export let home_title = 'Homepage';
</script>

<nav>
	<a sveltekit:prefetch href="/" class="home" title={home_title}>
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
		width: 100vw;
		height: var(--nav-h);
		margin: 0 auto;
		z-index: 100;
		user-select: none;
		box-shadow: 0 0 0 1px var(--mauve5);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-inline: var(--size-8);
		background-color: var(--lo-contrast);
	}

	@media (max-width: 768px) {
		nav {
			padding-inline: var(--size-3);
		}
	}

	ul {
		position: relative;
		width: 100%;
		padding: 0;
		margin: 0;
		list-style: none;
	}

	.home {
		height: var(--nav-h);
		display: flex;
	}

	ul {
		display: flex;
		width: auto;
	}
</style>
