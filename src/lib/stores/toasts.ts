import { writable } from 'svelte/store';

interface Toast {
	message: string;
	duration: number;
	timeout: number;
}

export const toasts = writable<Toast[]>([]);

export function addToast(message: string, duration = 4000) {
	const toast = {
		message: message,
		duration: duration,
		timeout: setTimeout(() => {
			removeToast(message);
		}, duration)
	};

	toasts.update((t) => {
		return [...t, toast];
	});
}

export function removeToast(message: string) {
	toasts.update((t) => {
		return removeToastFromArray(t, message) ?? [];
	});
}

export function removeAllToasts() {
	toasts.update((t) => {
		for (const toast of t) {
			removeToastFromArray(t, toast.message);
		}
		return [];
	});
}

// Internal toast removal method (usually used to delete previous duplicated toasts).
// NB! This doesn't update the store value! Use `removeToast()` instead.
function removeToastFromArray(arr: Toast[], message: string) {
	const toast = arr.find((t) => t.message === message);
	if (!toast) {
		return;
	}

	clearTimeout(toast.timeout);
	return arr.filter((t) => t.message !== message);
}
