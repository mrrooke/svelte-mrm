<script lang="ts">
	import { AlertTriangle } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import Katex from './Katex.svelte';
	import { Button } from './ui/button';
	import * as Tooltip from './ui/tooltip';

	export let err: string | null = null;
	export let label: string | null = null;
	export let focused = false;
</script>

<div class="expression" class:focused class:invalid={err != null}>
	<div class="w-12 h-full border-right pl-2.5 select-none py-1 relative">
		{#if label != null}
			<div class="ml-[-8px] mt-[-4px] text-sm">
				<Katex math={label} />
			</div>
		{/if}
		<div class="error-container">
			{#if err != null}
				<div
					class="absolute inset-0 flex items-center justify-center"
					in:fade={{ delay: 500, duration: 500 }}
					out:fade
				>
					<Tooltip.Root openDelay={0} closeDelay={20}>
						<Tooltip.Trigger asChild let:builder>
							<Button builders={[builder]} variant="ghost" size="icon" class="rounded-full"
								><AlertTriangle class="h-5 w-5" /></Button
							>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>{err}</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</div>
			{/if}
		</div>
	</div>
	<slot />
</div>

<style lang="postcss">
	.expression {
		@apply grid items-center w-full border grid-cols-[48px_1fr_40px] gap-1  transition-colors;

		--_border: var(--border);
		--_text: var(--foreground);
		--_background: var(--background);
		--_icon-color: var(--destructive) !important;
	}

	.focused {
		border-color: hsl(var(--primary));
	}

	.focused.invalid {
		border-color: hsl(var(--destructive));
	}
</style>
