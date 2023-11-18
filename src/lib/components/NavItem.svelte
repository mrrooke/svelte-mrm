<script lang="ts">
	import { page } from '$app/stores';

	export let href = '/';
	export let external: string | undefined = undefined;
	export let title: string | undefined = undefined;

	$: current = $page.url.pathname.startsWith(href);
</script>

{#if external}
	<li><a href={external} {title} rel="external"><slot /></a></li>
{:else}
	<li>
		<a aria-current={current} data-sveltekit-prefetch {href} {title}><slot /></a>
	</li>
{/if}

<style lang="postcss">
	a {
		@apply no-underline text-foreground/60;
	}

	a:where([aria-current='true']) {
		@apply text-foreground;
	}

	a:where(:not([aria-current='true']):hover) {
		@apply text-foreground/80;
	}

	a:where([aria-current='true']:hover) {
		@apply text-foreground/60;
	}
</style>
