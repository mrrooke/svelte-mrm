<script lang="ts">
	export let href: string;
</script>

<a {href}>Skip to main content</a>

<style>
	a {
		position: absolute;
		z-index: 101; /* 1 more than the nav z-index */
		padding: 8px;
		border: 2px solid black;
		background: white;
		color: var(--text);
		inset-block-start: 0;
		inset-inline-start: 0;
		transform: translateY(-100%);
	}

	a:focus {
		transform: translateY(0%);
	}
</style>
