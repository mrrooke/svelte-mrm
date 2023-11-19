<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Katex from './Katex.svelte';

	import { questions } from '$lib/stores/questions';
	import { Copy, RotateCcw, Settings } from 'lucide-svelte';

	import { toBlob } from 'html-to-image';

	let questionDiv: HTMLDivElement | null = null;

	function copyQuestions() {
		if (!questionDiv) return;

		toBlob(questionDiv, {
			backgroundColor: 'transparent',
			style: {
				color: 'black'
			}
		})
			.then(async function (blob) {
				if (!blob) return;
				if ('write' in navigator.clipboard) {
					await navigator.clipboard.write([
						new ClipboardItem({
							'image/png': blob
						})
					]);
				}
			})
			.catch(function (error) {
				console.error('oops, something went wrong!', error);
			});
	}
</script>

<div class="flex flex-col w-full px-4">
	<div class="flex gap-1 justify-end items-center h-12">
		<Button variant="outline" size="icon" class="rounded-full" on:click={questions.pull}>
			<RotateCcw class="h-4 w-4" />
		</Button>
		<Button variant="outline" size="icon" class="rounded-full" on:click={copyQuestions}>
			<Copy class="h-4 w-4" />
		</Button>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders={[builder]} variant="outline" size="icon" class="rounded-full"
					><Settings class="h-4 w-4" /></Button
				>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56">
				<DropdownMenu.Group>
					<DropdownMenu.Item>Profile</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div
		bind:this={questionDiv}
		class="grid grid-rows-5 grid-flow-col-dense gap-4 h-full max-h-full text-2xl overflow-hidden"
	>
		{#each $questions.questions as question, index}
			<p class="w-fit">
				<span class="font-bold mr-2">
					{index + 1}
				</span>
				<Katex math={question} />
			</p>
		{/each}
	</div>
</div>

<style>
	:global(.katex) {
		font-size: 1em;
	}
</style>
