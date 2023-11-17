<script lang="ts">
	import { AlertCircle } from 'lucide-svelte';
	import Tooltip from './Tooltip.svelte';
	import Katex from './Katex.svelte';
	import { fade } from 'svelte/transition';

	export let err: string | null = null;
	export let label: string | null = null;
	export let focused = false;
</script>

<div class="expression" class:focused class:invalid={err != null}>
	<div class="label">
		{#if label != null}
			<div class="number">
				<Katex math={label} />
			</div>
		{/if}
		<div class="error-container">
			{#if err != null}
				<div class="error" in:fade={{ delay: 500, duration: 500 }} out:fade>
					<Tooltip message={err}>
						<AlertCircle />
					</Tooltip>
				</div>
			{/if}
		</div>
	</div>
	<slot />
</div>

<style>
	.expression {
		--_border: var(--border);
		--_text: var(--foreground);
		--_background: var(--background);
		--_icon-color: var(--destructive) !important;
		--_transition-duration: 0.1s;
		--_transition: var(--_transition-duration) box-shadow ease,
			var(--_transition-duration) border ease, var(--_transition-duration) stroke ease;

		display: grid;
		grid-template-columns: 60px 1fr 40px;
		align-items: center;
		width: 100%;
		border: 1px solid hsl(var(--_border));
		gap: var(--size-2, 0.5rem);
		transition: var(--_transition);
	}

	.focused {
		border-color: hsl(var(--primary));
	}

	.focused.invalid {
		border-color: hsl(var(--destructive));
	}

	.label {
		--_text: var(--foreground);

		position: relative;
		color: hsl(var(--_text));
		width: 60px;
		height: 100%;
		border: none;
		border-right: var(--border-size-1) solid var(--expression-border-color);
		background-color: hsl(var(--_background));
		font-size: var(--_size);
		padding-left: 10px;
		transition:
			0.1s background-color ease,
			0.1s border-color ease;
		user-select: none;
		padding-block: var(--size-1);
	}

	.label .number {
		--_size: 0.75rem;

		font-size: var(--_size);
		margin-left: -8px;
		margin-top: -4px;
	}

	.error {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
