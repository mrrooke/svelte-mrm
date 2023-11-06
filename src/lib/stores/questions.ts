import { writable } from 'svelte/store';

export const questions = writable<{
	stream: ReadableStream<string> | null;
	reader: ReadableStreamDefaultReader<string> | null;
	questions: string[];
	allQuestions: string[];
	new: boolean;
	delayed: boolean;
	generate: boolean;
	changed: boolean;
}>({
	delayed: false,
	stream: null,
	reader: null,
	questions: [],
	allQuestions: [],
	new: false,
	generate: false,
	changed: false
});
