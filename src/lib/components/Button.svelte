<script lang="ts" context="module">
	type ButtonVariant =
		| 'default'
		| 'primary'
		| 'success'
		| 'neutral'
		| 'warning'
		| 'danger'
		| 'text';
	type Size = 'small' | 'medium' | 'large';
</script>

<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	export let element: HTMLButtonElement | HTMLAnchorElement | undefined = undefined,
		style: string | undefined = undefined,
		variant: ButtonVariant = 'default',
		size: Size = 'medium',
		outline = false,
		caret = false,
		circle = false,
		href: string | undefined = undefined,
		name: string | undefined = undefined,
		value: string | undefined = undefined,
		target: '_blank' | '_parent' | '_self' | '_top' | undefined = undefined,
		download: string | undefined = undefined,
		disabled = false,
		loading = false,
		uppercase = false,
		fullSize = false,
		type: 'button' | 'submit' | 'reset' = 'button';

	// focus and blur functions
	export function focus(options?: { preventScroll?: boolean }) {
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
		><slot>link</slot>
	</a>
{:else}
	<button
		bind:this={element}
		class:fullSize
		class:uppercase
		class:outline
		class:circle
		class:caret
		class:has-label={$$slots.default}
		class:has-prefix={$$slots.prefix}
		class:has-suffix={$$slots.suffix}
		class:primary={variant === 'primary'}
		class:success={variant === 'success'}
		class:neutral={variant === 'neutral'}
		class:warning={variant === 'warning'}
		class:danger={variant === 'danger'}
		class:text={variant === 'text'}
		class:small={size === 'small'}
		class:medium={size === 'medium'}
		class:large={size === 'large'}
		on:click
		on:focus
		on:blur
		{disabled}
		aria-disabled={disabled ? 'true' : undefined}
		{type}
		{style}
		{name}
		{value}
	>
		{#if $$slots.prefix}
			<span class="prefix">
				<slot name="prefix" />
			</span>
		{/if}
		<span class="label">
			<slot>Button</slot>
		</span>
		{#if $$slots.suffix}
			<span class="suffix">
				<slot name="suffix" />
			</span>
		{/if}
		{#if caret}
			<span class="caret-icon">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</span>
		{/if}
		{#if loading}
			<span class="loading">
				<Loader2 />
			</span>
		{/if}
	</button>
{/if}

<style>
	button {
		--button-color: var(--hi-contrast);
		--button-color-focus: var(--button-color);
		--button-background: var(--lo-contrast);
		--button-background-focus: var(--button-background, red);
		--button-background-active: var(--slate2);
		--button-padding: var(--size-2);
		--button-size: var(--font-size-2, 1rem);
		--button-font-weight: var(--font-weight-4);
		--button-radius: var(--radius-1);
		--button-height: 2.5rem;
		--button-border-width: var(--border-size-2, 2px);
		--button-border-color: var(--slate7);
		--button-border-focus-color: var(--slate8);
		--button-border-active-color: var(--slate8);

		all: unset;
		display: inline-flex;
		height: var(--button-height);
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: var(--button-radius);
		background: var(--button-background);
		color: var(--button-color);
		cursor: pointer;
		font: inherit;
		font-size: var(--button-size);
		font-variant-numeric: tabular-nums;
		font-weight: var(--button-font-weight);
		letter-spacing: inherit;
		outline: var(--button-border-width) solid var(--button-border-color);
		touch-action: manipulation;
		user-select: none;
	}

	button:disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	button:is(:hover, :focus-visible) {
		--button-border-color: var(--button-border-focus-color);
		--button-border-width: 3px;
		--button-background: var(--button-background-focus);
		--button-color: var(--button-color-focus);
	}

	button:active {
		--button-background: var(--button-background-active);
	}

	button::before,
	button::after {
		box-sizing: border-box;
	}

	.label {
		padding: 0 var(--button-padding);
	}

	.prefix,
	.suffix {
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		pointer-events: none;
	}

	.primary {
		--button-color: var(--blue11);
		--button-background: var(--blue2);
		--button-background-active: var(--blue3);
		--button-border-color: var(--blue7);
		--button-border-focus-color: var(--blue8);
	}

	.success {
		--button-color: var(--green11);
		--button-background: var(--green2);
		--button-background-active: var(--green3);
		--button-border-color: var(--green7);
		--button-border-focus-color: var(--green8);
	}

	.neutral {
		--button-color: var(--mauve11);
		--button-background: var(--mauve2);
		--button-background-active: var(--mauve3);
		--button-border-color: var(--mauve7);
		--button-border-focus-color: var(--mauve8);
	}

	.warning {
		--button-color: var(--amber11);
		--button-background: var(--amber2);
		--button-background-active: var(--amber3);
		--button-border-color: var(--amber7);
		--button-border-focus-color: var(--amber8);
	}

	.danger {
		--button-color: var(--red11);
		--button-background: var(--red2);
		--button-background-active: var(--red3);
		--button-border-color: var(--red7);
		--button-border-focus-color: var(--red8);
	}

	.text {
		--button-color: var(--slate8);
		--button-border-color: transparent;
		--button-background: transparent;
		--button-border-focus-color: transparent;
		--button-color-focus: var(--slate10);
	}

	.outline {
		--button-background-color: transparent;
	}

	.small {
		--button-size: var(--font-size-1);
		--button-height: 1.875rem;
		--button-radius: var(--radius-1);
		--button-padding: var(--size-1);
	}

	.medium {
		--button-size: var(--font-size-2);
		--button-height: 2.5rem;
		--button-radius: var(--radius-2);
		--button-padding: var(--size-2);
	}

	.large {
		--button-size: var(--font-size-3);
		--button-height: 3.125rem;
		--button-radius: var(--radius-2);
		--button-padding: var(--size-2);
	}

	.circle {
		--button-radius: 50%;
		--button-padding: 0;
	}

	.caret.small {
		padding-inline-end: var(--size-1);
	}

	.caret.medium {
		padding-inline-end: var(--size-2);
	}

	.caret.large {
		padding-inline-end: var(--size-3);
	}

	.caret-icon {
		display: flex;
		align-items: center;
	}

	.caret-icon svg {
		width: 1em;
		height: 1em;
	}

	.has-label.small .label {
		padding: 0 var(--size-1);
	}

	.has-label.medium .label {
		padding: 0 var(--size-2);
	}

	.has-label.large .label {
		padding: 0 var(--size-3);
	}

	.has-prefix.small {
		padding-inline-start: var(--size-1);
	}

	.has-prefix.small .label {
		padding-inline-start: var(--size-1);
	}

	.has-prefix.medium {
		padding-inline-start: var(--size-2);
	}

	.has-prefix.medium .label {
		padding-inline-start: var(--size-2);
	}

	.has-prefix.large {
		padding-inline-start: var(--size-3);
	}

	.has-prefix.large .label {
		padding-inline-start: var(--size-3);
	}

	.has-suffix.small,
	.caret.small {
		padding-inline-end: var(--size-1);
	}

	.has-suffix.small .label,
	.caret.small .label {
		padding-inline-end: var(--size-1);
	}

	.has-suffix.medium,
	.caret.medium {
		padding-inline-end: var(--size-2);
	}

	.has-suffix.medium .label,
	.caret.medium .label {
		padding-inline-end: var(--size-2);
	}

	.has-suffix.large,
	.caret.large {
		padding-inline-end: var(--size-3);
	}

	.has-suffix.large .label,
	.caret.large .label {
		padding-inline-end: var(--size-3);
	}
</style>
