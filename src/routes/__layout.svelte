<script>
	import Nav from '../components/Nav.svelte';
	import NavItem from '../components/NavItem.svelte';
	import SkipLink from '../components/SkipLink.svelte';

	import { page, navigating, session } from '$app/stores';
</script>

<SkipLink href="#main" />
<Nav {page} logo="🧮">
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
	@import 'open-props/sizes';
	@import 'open-props/fonts';
	@import 'open-props/borders';
	@import 'open-props/shadows';
	@import 'open-props/zindex';
	@import 'open-props/animations';
	@import 'open-props/easings';

	main {
		position: relative;
		margin: 0 auto;
		top: var(--nav-h);
		height: calc(100% - var(--nav-h));
	}
</style>
