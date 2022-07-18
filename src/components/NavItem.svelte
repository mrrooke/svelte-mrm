<script lang="ts">
	import { page } from '$app/stores';

	export let href = '/';
	export let external: string | undefined = undefined;
	export let title: string | undefined = undefined;
</script>

{#if external}
	<li><a href={external} {title} rel="external"><slot /></a></li>
{:else}
	<li>
		<a
			aria-current={$page.url.pathname.startsWith(href) ? true : undefined}
			sveltekit:prefetch
			{href}
			{title}><slot /></a
		>
	</li>
{/if}
