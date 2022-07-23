<script lang="ts">
	import { tick } from 'svelte';

	export let label: string;
	export let position: 'top' | 'bottom' | 'left' | 'right' = 'left';

	let visible = false;
	let hidden = true;
	let container: HTMLDivElement;
	let trigger: HTMLButtonElement;
	let tooltip: HTMLParagraphElement;
	let windowWidth: number;
	let windowHeight: number;

	async function open() {
		visible = true;
		hidden = false;
		await tick();
		checkBoundingBox();
	}

	function hide() {
		visible = false;
		hidden = true;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (visible) {
			if (e.key === 'Escape' || e.key === 'Esc') {
				hide();
			}
		}
	}

	function handlePointerDown(e: MouseEvent) {
		switch (e.target) {
			case container:
			case trigger:
			case tooltip:
				e.preventDefault();
				break;
			default:
				hide();
				trigger.blur();
		}
	}

	// Calculate if the tooltip is within the viewport
	function checkBoundingBox() {
		let bounds = tooltip.getBoundingClientRect();

		checkHorizontalBounding(bounds);
		checkVerticalBounding(bounds);
	}

	function checkHorizontalBounding(bounds: DOMRect) {
		// If the tooltip overlaps on both sides, throw an error
		if (bounds.right > windowWidth && bounds.left < 0) {
			throw new Error('Tooltip width too wide for the window');
		}

		// Check if the right side of the tooltip is beyond the right side of the viewport
		if (bounds.right > windowWidth) {
			moveTooltipLeft(bounds, windowWidth);
		}

		// Check if the left side of the tooltip is beyond the left side of the viewport
		if (bounds.left < 0) {
			moveTooltipRight(bounds);
		}
	}

	function checkVerticalBounding(bounds: DOMRect) {
		// If the tooltip overlaps on both sides, throw an error
		if (bounds.bottom > windowHeight && bounds.top < 0) {
			throw new Error('Tooltip height too high for the window');
		}

		// Check if the bottom of the tooltip is below the bottom of the viewport
		if (bounds.bottom > windowHeight) {
			moveTooltipUp();
		}

		// Check if the top of the tooltip is above the top of the viewport
		if (bounds.top < 0) {
			moveTooltipDown();
		}
	}

	// Move the tooltip so it fits within the viewport
	function moveTooltipUp() {
		container.classList.add('top');
	}

	function moveTooltipRight(bounds: DOMRect) {
		let numToMove = Math.floor(bounds.width / 2);
		tooltip.style.left = `${numToMove}px`;
	}

	function moveTooltipDown() {
		container.classList.remove('top');
	}

	function moveTooltipLeft(bounds: DOMRect, windowWidth: number) {
		let translateAmount = windowWidth - Math.round(bounds.right) - Math.round(bounds.width) / 1.6;
		tooltip.style.transform = `translateX(${translateAmount}px)`;
	}
</script>

<svelte:window
	on:keydown={handleKeyDown}
	on:pointerdown={handlePointerDown}
	bind:innerWidth={windowWidth}
	bind:innerHeight={windowHeight}
/>

<div
	bind:this={container}
	class="container"
	class:visible
	class:top={position === 'top'}
	class:bottom={position === 'bottom'}
	on:mouseenter={open}
	on:mouseleave={hide}
	data-tooltip-position={position}
>
	<button
		bind:this={trigger}
		class="trigger"
		type="button"
		aria-describedby="description"
		data-tooltip-trigger
		data-state={visible ? 'open' : 'closed'}
		on:focus={open}
		on:blur={hide}
	>
		<slot />
	</button>
	<p bind:this={tooltip} id="description" role="tooltip" class:hidden>
		{label}
	</p>
</div>

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
		outline: none;
	}

	button:focus-visible {
		outline: solid 2px var(--blue7);
		outline-offset: 1px;
	}

	button::before,
	button::after {
		box-sizing: border-box;
	}

	.container {
		position: relative;
		display: inline-block;
		flex-shrink: 0;

		--tooltip-thingy-height: 0.5em;
	}

	/* The arrow (or tooltip thingy) that connects the tooltip to the container */
	.container::before {
		position: absolute;
		top: 100%;
		left: 50%;
		border: var(--tooltip-thingy-height) solid transparent;
		border-bottom-color: black;
		transform: translateX(-50%);
	}

	/* This allows users to move their cursor from the button to the tooltip */
	.container::after {
		position: absolute;
		top: 100%;
		right: -20%;
		left: -20%;
		display: block;
		height: calc(var(--tooltip-thingy-height) * 2);
	}

	[role='tooltip'] {
		position: absolute;
		z-index: var(--layer-1);
		top: calc(100% + var(--tooltip-thingy-height));
		left: 50%;
		min-width: max-content;
		max-width: 10em;
		padding: 0.5em 1em;
		margin: 0;
		background: var(--transparent-panel);
		border-radius: var(--border-0);
		box-shadow: var(--shadow-light);
		color: var(--lo-contrast);
		font-size: var(--font-size-0);
		opacity: 100;
		transform: translateX(-50%);
		transition: opacity 0.2s var(--ease-3);
		transition-delay: 0.2s;
	}

	.container.top [role='tooltip'] {
		bottom: calc(100% + var(--tooltip-thingy-height) * 2);
	}

	/* Tooltip styles */

	/* Hides the tooltip */
	.hidden {
		opacity: 0;
		transition: opacity 0.2s var(--ease-3);
		visibility: hidden;
	}
</style>
