import { shuffle } from '$lib/utils';
import { writable } from 'svelte/store';

interface QuestionState {
	question: string;
	answer: string;
	active: boolean;
	used: boolean;
}

interface ProblemState {
	stream: ReadableStream<string> | null;
	reader: ReadableStreamDefaultReader<string> | null;
	questions: string[];
	allQuestions: QuestionState[];
	new: boolean;
	delayed: boolean;
	generate: boolean;
	changed: boolean;
}

function createProblemState() {
	const { subscribe, set, update } = writable<ProblemState>({
		delayed: false,
		stream: null,
		reader: null,
		allQuestions: [],
		questions: [],
		new: false,
		generate: false,
		changed: false
	});

	/** Pull returns a given number of questions remaining from the active question pool */
	function pull() {
		update((state) => {
			// Ensure that all questions are marked as used
			state.allQuestions.forEach((q) => {
				if (q.active) {
					q.active = false;
					q.used = true;
				}
			});

			const unusedQuestions = state.allQuestions.filter((q) => !q.used);

			if (unusedQuestions.length < 5) {
				throw new Error('Not enough questions to pull');
			}

			const nextQuestions = shuffle(unusedQuestions).slice(0, 5);

			nextQuestions.forEach((q) => {
				q.active = true;
			});

			state.questions = nextQuestions.map((q) => q.question);
			return state;
		});
	}

	return { subscribe, set, update, pull };
}

export const questions = createProblemState();
