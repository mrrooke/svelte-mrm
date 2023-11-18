<script lang="ts">
	import Katex from './Katex.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	import { questions } from '$lib/stores/questions';
	import { Settings } from 'lucide-svelte';
</script>

<div class="flex flex-col w-full pr-4">
	<div class="flex justify-end items-center h-12">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders={[builder]} variant="ghost" size="icon" class="rounded-full"
					><Settings class="h-4 w-4" /></Button
				>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56">
				<DropdownMenu.Label>My Account</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						Profile
						<DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						Billing
						<DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						Settings
						<DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						Keyboard shortcuts
						<DropdownMenu.Shortcut>⌘K</DropdownMenu.Shortcut>
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>Team</DropdownMenu.Item>
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger>Invite users</DropdownMenu.SubTrigger>
						<DropdownMenu.SubContent>
							<DropdownMenu.Item>Email</DropdownMenu.Item>
							<DropdownMenu.Item>Message</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item>More...</DropdownMenu.Item>
						</DropdownMenu.SubContent>
					</DropdownMenu.Sub>
					<DropdownMenu.Item>
						New Team
						<DropdownMenu.Shortcut>⌘+T</DropdownMenu.Shortcut>
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>GitHub</DropdownMenu.Item>
				<DropdownMenu.Item>Support</DropdownMenu.Item>
				<DropdownMenu.Item>API</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>
					Log out
					<DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="questions">
		{#each $questions.questions as question}
			<div>
				<Katex math={question} fleqn={true} displayMode />
			</div>
		{/each}
	</div>
</div>

<style>
	.questions {
		display: grid;
		height: 100%;
		font-size: 1.5rem;
		overflow-y: auto;
		background: transparent;
	}

	:global(.katex-display) {
		margin: 0;
	}
</style>
