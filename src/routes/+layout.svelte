<script>
	import '../app.postcss';
	import Nav from '$lib/components/Nav.svelte';
	import NavItem from '$lib/components/NavItem.svelte';
	import SkipLink from '$lib/components/SkipLink.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
</script>

<SkipLink href="#main"></SkipLink>

<div class="flex flex-col h-[calc(100dvh)]">
	<header class="w-full">
		<Nav logo="🧮">
			<svelte:fragment slot="nav-center">
				<NavItem href="/">generator</NavItem>
				<NavItem href="/calculator">calculator</NavItem>
			</svelte:fragment>

			<svelte:fragment slot="nav-right">
				<NavItem href="/">about</NavItem>
				<ThemeToggle />
			</svelte:fragment>
		</Nav>
	</header>
	<main class="flex-1 relative overflow-hidden">
		<slot />
	</main>
</div>
<ModeWatcher />
