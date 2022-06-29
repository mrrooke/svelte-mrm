<script lang="ts">
    import EditableMF from "./EditableMF.svelte";

    type Domain = {
        state: boolean;
        type: "integer" | "rational" | "real" | "discrete";
        low: number;
        high: number;
        variable: string;
    };
    type Constraint = {
        expression: string;
        id: number;
    };
    type ProblemRequest = {
        expression: string;
        domains: Domain[];
        constraints: Constraint[];
    };

    type ProblemResponse = {
        error: string | undefined;
        questions: string[] | undefined;
    };

    export let questions: string[] = []
    let expression: string;
    let symbols: string[] = [];
    let domains: Domain[] = [];
    let activeDomains: Domain[] = [];
    let constraints: Constraint[] = []
    let err = "";
    let invalid: boolean

    $: newConstraintId = constraints.length ? Math.max(...constraints.map(t => t.id)) + 1 : 1
    $: invalid = err !== ""
    $: domains = updateDomains(domains, symbols)
    $: activeDomains = domains.filter((d) => d.state === true)

    function updateDomains(domains: Domain[], symbols: string[]): Domain[] {
        symbols.map((variable) => {
            const domain = domains.find((d) => d.variable === variable)
            if (domain === undefined) {
                domains.push({variable, low: -10, high: 10, type: "integer", state: false})
                domains.sort((a, b) => a.variable.localeCompare(b.variable));
            }
        })
        domains.map((domain) => {
            if (!symbols.includes(domain.variable)) {
                domains = domains.filter((d) => d.variable !== domain.variable)
            }
        });
        return domains
    }

    function generateProblem() {
        const problem: ProblemRequest = {
            constraints,
            domains: activeDomains,
            expression,
        }
        const result: ProblemResponse = JSON.parse(self.mrm_generate(JSON.stringify(problem)))
        const {error: err, questions: qs} = result
        if (err !== undefined) {
            console.warn(err)
            return
        } else {
            questions = qs
        }
    }
</script>

<form on:submit|preventDefault={generateProblem} class="problem">
    <button style="margin-bottom: 3px;">Generate</button>
    <div class="expression" class:invalid>
        <span class="label">f(x)</span>
        <EditableMF bind:expression={expression} bind:symbols={symbols} bind:err={err}/>
    </div>
    <div style="display: flex">
        {#each domains as domain}
            <label>
                {domain.variable}
                <input type="checkbox" bind:checked={domain.state}/>
            </label>
        {/each}
    </div>
    {#each activeDomains as domain (domain.variable)}
        <div class="expression">
            <span class="label">{domain.variable}</span>
            <div class="content">
                <input type="number" bind:value={domain.low} style="width: 38px"/>
                ≤{domain.variable}≤
                <input type="number" style="width: 38px" bind:value={domain.high}/>
                <span style="margin-left: auto;">
                Step:
                    </span>
                <EditableMF/>
                <button on:click|preventDefault={() => domain.state = false }>x</button>
            </div>
        </div>
    {/each}
    {#each constraints as constraint (constraint.id)}
        <div class="expression">
            <span class="label">k(x)</span>
            <EditableMF bind:expression={constraint.expression}/>
        </div>
    {/each}
    <button type="button" on:click|preventDefault={() => {
        constraints = [...constraints, {id: newConstraintId,expression: ""}]
    }}>
        +
    </button>
</form>

<style>
    .problem {
        display: flex;
        flex-direction: column;
        min-width: 40ch;
    }

    .expression {
        display: flex;
        flex-direction: row;
        width: 100%;
        align-items: center;
        gap: 1rem;
        border: 1px solid gray;
    }

    .expression:focus-within {
        border-color: lightblue;
    }

    .label {
        width: 38px;
        background-color: azure;
        height: 100%;
        border-right: 1px solid gray;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .content {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;

    }
</style>