<script lang="ts">
    import {onMount} from 'svelte';
    import Problem from "../components/Problem.svelte";
    import Katex from "../components/Katex.svelte";

    declare class Go {
        argv: string[];
        env: { [envKey: string]: string };
        exit: (code: number) => void;
        importObject: WebAssembly.Imports;
        exited: boolean;
        mem: DataView;

        run(instance: WebAssembly.Instance): Promise<void>;
    }

    let questions: string[] = []

    onMount(() => {
        const go = new Go();
        WebAssembly.instantiateStreaming(fetch('./main.wasm'), go.importObject).then((result) => {
            go.run(result.instance);
        });
    });
</script>

<h1>Welcome to mrm</h1>

<div class="container">
    <Problem bind:questions={questions}/>
    <div class="question-container">
        <h2>Questions</h2>
        <ol>
            {#each questions as question}
                <li><Katex math={question}/></li>
            {/each}
        </ol>
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-direction: row;
        gap: 3rem;
    }
</style>
