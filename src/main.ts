import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { initBoard } from './lib/board';
import { initTheme } from './lib/theme';

initTheme();
initBoard();

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
