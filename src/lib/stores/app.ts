import { writable } from 'svelte/store';

export const darkMode = writable<boolean>(true);
export const toastMessage = writable<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

export function showToast(text: string, type: 'success' | 'error' | 'info' = 'success') {
  toastMessage.set({ text, type });
  setTimeout(() => toastMessage.set(null), 3500);
}
