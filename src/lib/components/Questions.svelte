<svelte:options immutable={true} />

<script lang="ts">
	import { quintOut } from 'svelte/easing';

	import { fade } from 'svelte/transition';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import IconButton from './IconButton.svelte';
	import Katex from './Katex.svelte';

	export let generate: () => void;
	export let questions: string[];
	export let changed: boolean;
	export let valid: boolean;

	function closeDialog() {
		changed = false;
	}

	// TODO first load specific dialog
	// TODO show specific error messages for why it won't load
	// TODO handle validity for constraints/domains
	// TODO Katex display mode questions
</script>

{#if changed}
	<div class="base">
		<div
			class="overlay"
			transition:fade={{ duration: 200, easing: quintOut }}
			on:click={closeDialog}
		/>
		<div class="dialog" transition:fade={{ duration: 200, easing: quintOut }}>
			<header>
				<h3>Update questions</h3>
				<IconButton on:click={closeDialog} name="x" label="close dialog" />
			</header>
			<section>
				<p>Your constraints have changed.</p>
				<p>Do you want to update?</p>
			</section>
			<footer>
				<Button on:click={closeDialog}>
					cancel
					<Icon name="x-circle" slot="suffix" />
				</Button>
				<Button type="submit" on:click={generate} disabled={!valid}>
					update
					<Icon name="refresh-cw" slot="suffix" />
				</Button>
			</footer>
		</div>
	</div>
{/if}
<ol class="stack questions">
	{#each questions as question}
		<li>
			<Katex math={question} displayMode />
		</li>
	{/each}
</ol>

<style>
	.stack {
		--stack-space: var(--size-1);

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.stack > * + * {
		margin-top: var(--stack-space);
	}

	.questions {
		height: 100%;
		overflow-y: auto;
	}

	.base {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-block-start: var(--size-3);
	}

	.overlay {
		position: absolute;
		z-index: 2;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		backdrop-filter: blur(3px);
		cursor: pointer;
	}

	.dialog {
		z-index: var(--layer-4);
		display: grid;
		align-items: start;
		background-color: var(--panel);
		border-radius: var(--border-size-3);
		box-shadow: var(--shadow-3);
		grid-template-rows: auto 1fr auto;
		max-block-size: min(80vw, 100%);
		max-inline-size: min(90vw, var(--size-content-3));
		min-inline-size: var(--size-content-2);
	}

	@media (max-width: 768px) {
		.dialog {
			min-inline-size: 100%;
		}
	}

	.dialog > header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--size-3);
		padding-block: var(--size-3);
		padding-inline: var(--size-5);
	}

	.dialog > section {
		padding-inline: var(--size-5);
	}

	.dialog > footer {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		background: var(--surface-2);
		gap: var(--size-3);
		padding-block: var(--size-3);
		padding-inline: var(--size-5);
	}
</style>
