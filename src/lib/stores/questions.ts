import { writable } from 'svelte/store';

export const questions = writable<{
	stream: ReadableStream<string> | null;
	reader: ReadableStreamDefaultReader<string> | null;
	questions: string[];
	new: boolean;
	delayed: boolean;
	generate: boolean;
}>({
	delayed: false,
	stream: null,
	reader: null,
	questions: [],
	new: false,
	generate: false
});
