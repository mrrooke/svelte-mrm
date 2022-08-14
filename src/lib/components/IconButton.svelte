<script lang="ts" context="module">
</script>

<script lang="ts">
	import Icon from './Icon.svelte';

	export let element: HTMLButtonElement | HTMLAnchorElement | undefined = undefined,
		name = 'help-circle',
		style: string | undefined = undefined,
		href: string | undefined = undefined,
		target: '_blank' | '_parent' | '_self' | '_top' | undefined = undefined,
		download: string | undefined = undefined,
		label: string,
		disabled = false;

	// focus and blur functions
	export function focus(options?: FocusOptions) {
		element && element.focus(options);
	}

	export function blur() {
		element && element.blur();
	}

	export function click() {
		element && element.click();
	}
</script>

{#if href}
	<a
		bind:this={element}
		{href}
		{target}
		{download}
		rel={target ? 'noreferrer noopener' : undefined}
		on:click
		on:focus
		on:blur
		aria-label={label}
		><slot>link</slot>
	</a>
{:else}
	<button
		bind:this={element}
		on:click
		on:focus
		on:blur
		{disabled}
		aria-disabled={disabled ? 'true' : undefined}
		aria-label={label}
		{style}
	>
		<Icon {name} />
	</button>
{/if}

<style>
	button {
		--button-color: var(--mauve-12);

		display: flex;
		flex: 0 0 auto;
		align-items: center;
		padding: var(--size-1);
		border: none;
		appearance: none;
		background: none;
		border-radius: var(--radius-1);
		color: var(--button-color);
		cursor: pointer;
		font-size: inherit;
		transition: var(--ease-1) color;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
		pointer-events: none;
	}

	button:is(:hover) {
		--button-color: var(--blue11);

		outline: none;
	}

	button:focus-visible {
		outline: solid 2px var(--blue7);
		outline-offset: 1px;

		--button-color: var(--blue11);
	}

	button:active {
		--button-color: var(--blue10);
	}

	button::before,
	button::after {
		box-sizing: border-box;
	}
</style>
