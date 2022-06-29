<script lang="ts">
    import {onMount, type SvelteComponent} from 'svelte';

    let MQ: SvelteComponent;
    export let expression = "";
    export let symbols: string[] = [];
    export let err = ""
    export let style=""

    onMount(async () => {
        MQ = (await import('./mq.svelte')).default;
    });

    const handlers = {
        edit: (mf) => {
            expression = mf.latex()
            if (expression == "") {
                symbols = []
                err = ""
            }
            const res = JSON.parse(self.mrm_parse(expression))
            if (res.error) {
                err = res.error
            }  else {
                symbols = res.symbols
                err = ""
            }
        }
    };
</script>

<div class="container" {style}>
    <svelte:component this={MQ} {handlers}/>
</div>

<style>
    .container {
        width: 100%;
        min-height: 3rem;
        display: flex;
        align-items: center;
    }
</style>
