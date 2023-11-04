import { writable } from 'svelte/store';

export const questions = writable<{
	stream: ReadableStream<string> | null;
	controller: ReadableStreamDefaultController<string[]> | null;
	questions: string[];
	new: boolean;
	delayed: boolean;
}>({
	delayed: false,
	stream: null,
	controller: null,
	questions: [],
	new: false
});
