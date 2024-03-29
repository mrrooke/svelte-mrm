/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
	// interface Locals {}
	// interface Platform {}
	// interface Session {}
	// interface Stuff {}
}

declare interface Window {
	mrm_parse(s: string): string;
	mrm_generate(s: string): string;
	mrm_stream(s: string): ReadableStream<string[]>;
	MathQuill: MathQuill.MathQuill;
}
