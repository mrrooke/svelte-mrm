<script>
	import Nav from '$lib/components/Nav.svelte';
	import NavItem from '$lib/components/NavItem.svelte';
	import SkipLink from '$lib/components/SkipLink.svelte';

	import '../styles/main.css';
	import { onMount } from 'svelte';

	import '@shoelace-style/shoelace/dist/themes/light.css';
	import '@shoelace-style/shoelace/dist/themes/dark.css';

	onMount(async () => {
		await import('@shoelace-style/shoelace/dist/components/button/button');
		await import('@shoelace-style/shoelace/dist/components/dropdown/dropdown');
		await import('@shoelace-style/shoelace/dist/components/menu/menu');
		await import('@shoelace-style/shoelace/dist/components/menu-item/menu-item');
		await import('@shoelace-style/shoelace/dist/components/divider/divider');
		await import('@shoelace-style/shoelace/dist/components/icon/icon');
	});
	export const ssr = false;
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
