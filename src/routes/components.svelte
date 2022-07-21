<script>
	import Button from '../components/Button.svelte';
</script>

<div style="padding-block:var(--size-2)">
	<Button variant="default">default</Button>
	<Button variant="danger">danger</Button>
	<Button variant="neutral">neutral</Button>
	<Button variant="primary">primary</Button>
	<Button variant="success">success</Button>
	<Button variant="text">text</Button>
	<Button variant="warning">warning</Button>
	<Button variant="primary" disabled>disabled</Button>
	<Button caret>caret</Button>
	<Button circle>circle</Button>
	<Button outline>outline</Button>
	<Button size="small">small</Button>
	<Button size="medium">medium</Button>
	<Button size="large">large</Button>
</div>
