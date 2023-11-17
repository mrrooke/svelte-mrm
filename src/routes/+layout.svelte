<script>
	import Nav from '$lib/components/Nav.svelte';
	import NavItem from '$lib/components/NavItem.svelte';
	import SkipLink from '$lib/components/SkipLink.svelte';

	// import '../styles/main.css';
	import '../styles/base.css';
</script>

<SkipLink href="#main" />

<div class="container">
	<header>
		<Nav logo="🧮">
			<svelte:fragment slot="nav-center">
				<NavItem href="/">generator</NavItem>
				<NavItem href="/calculator">calculator</NavItem>
			</svelte:fragment>

			<svelte:fragment slot="nav-right">
				<NavItem href="/">about</NavItem>
			</svelte:fragment>
		</Nav>
	</header>
	<main>
		<slot />
	</main>
</div>

<style global>
	:global(body) {
		height: 100vh;
		margin: 0;
	}

	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	main {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	header {
		width: 100%;
	}
</style>
