<script>
	import Nav from '$lib/components/Nav.svelte';
	import NavItem from '$lib/components/NavItem.svelte';
	import SkipLink from '$lib/components/SkipLink.svelte';

	import '../styles/main.css';
</script>

<SkipLink href="#main" />
<Nav logo="🧮">
	<svelte:fragment slot="nav-center">
		<NavItem href="/">generator</NavItem>
	</svelte:fragment>

	<svelte:fragment slot="nav-right">
		<NavItem href="/">about</NavItem>
	</svelte:fragment>
</Nav>
<main id="main">
	<slot />
</main>

<style global>
	main {
		position: relative;
		top: var(--nav-h);
		height: calc(100% - var(--nav-h));
		margin: 0 auto;
	}
</style>
