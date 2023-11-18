<script lang="ts">
	export let logo: string;
	export let home_title = 'Homepage';
</script>

<nav class="flex w-screen items-center justify-between font-medium border-b md:px-4 px-8 h-12">
	<a data-sveltekit-prefetch href="/" class=" no-underline font-bold" title={home_title}>
		{logo}&nbsp;mrm
	</a>

	<ul class="relative flex items-center gap-4 justify-center w-full p-0 list-none m-0">
		<slot name="nav-center" />
	</ul>

	<ul class="relative flex items-center gap-4 space-between p-0 list-none m-0">
		<slot name="nav-right" />
	</ul>
</nav>
