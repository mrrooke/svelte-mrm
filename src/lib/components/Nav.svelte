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
		display: flex;
		width: 100vw;
		align-items: center;
		justify-content: space-between;
		font-weight: 500;
		border-bottom: solid 1px hsl(var(--border));
		padding-inline: var(--size-8);
		height: var(--size-8);
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
		text-decoration: none;
		font-weight: 600;
		color: hsl(var(--foreground));
	}
</style>
