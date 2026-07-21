import { get, writable } from 'svelte/store';
import type { ThemeMode } from './types';
import { THEME_KEY } from './types';

function systemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function loadTheme(): ThemeMode {
  if (typeof localStorage === 'undefined') return systemTheme();
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return systemTheme();
}

export const theme = writable<ThemeMode>('light');

export function initTheme(): void {
  const initial = loadTheme();
  theme.set(initial);
  applyTheme(initial);
}

export function applyTheme(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = mode;
  localStorage.setItem(THEME_KEY, mode);
}

export function toggleTheme(): void {
  const next: ThemeMode = get(theme) === 'light' ? 'dark' : 'light';
  theme.set(next);
  applyTheme(next);
}
