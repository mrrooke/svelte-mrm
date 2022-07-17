<script lang="ts">
  import { fade } from "svelte/transition";
  import Icon from "./Icon.svelte";
  import Katex from "./Katex.svelte";
  import Stack from "./layout/Stack.svelte";

  export let generate;
  export let questions;
  export let changed: boolean;

  function closeDialog() {
    changed = false;
  }

</script>
{#if changed}
  <div class="overlay" transition:fade={{ duration: 200 }} on:click={closeDialog}>
    <div class="dialog">
      <header>
        <h3>Update questions</h3>
        <button on:click={closeDialog}>
          <Icon name="x" />
        </button>
      </header>
      <section>
        <p>Your constraints have changed.</p>
        <p>Do you want to update?</p>
      </section>
      <footer>
        <button
          style="display: inline-flex; gap: var(--size-1);justify-content: space-between"
          on:click={closeDialog}
        >
          <Icon name="x-circle" />
          cancel
        </button>
        <button
          style="display: inline-flex; gap: var(--size-1);justify-content: space-between"
          type="submit"
          on:click={generate}
        >
          <Icon name="refresh-cw" />
          update
        </button>
      </footer>
    </div>
  </div>
{/if}
<Stack element="ol">
  {#each questions as question}
    <li>
      <Katex math={question} />
    </li>
  {/each}
</Stack>

<style>

    .overlay {
        backdrop-filter: blur(3px);
        cursor: pointer;
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: var(--layer-important);

        display: flex;
        justify-content: center;
        align-items: flex-start;

        padding-block-start: var(--size-3);
    }

    .dialog {
        display: grid;
        grid-template-rows: auto 1fr auto;
        align-items: start;
        min-inline-size: var(--size-content-2);
        max-inline-size: min(90vw, var(--size-content-3));
        max-block-size: min(80vw, 100%);
        background-color: var(--panel);
        border-radius: var(--border-size-3);
        box-shadow: var(--shadow-3);
        z-index: var(--layer-important);
    }

    .dialog > header {
        display: flex;
        gap: var(--size-3);
        justify-content: space-between;
        align-items: flex-start;
        padding-block: var(--size-3);
        padding-inline: var(--size-5);
    }

    .dialog > section {
        padding-inline: var(--size-5);
    }

    .dialog > footer {
        background: var(--surface-2);
        display: flex;
        flex-wrap: wrap;
        gap: var(--size-3);
        justify-content: space-between;
        align-items: flex-start;
        padding-inline: var(--size-5);
        padding-block: var(--size-3);
    }
</style>