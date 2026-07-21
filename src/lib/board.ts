import { derived, get, writable } from 'svelte/store';
import {
  createEmptyBoard,
  createTask,
  loadBoard,
  replaceColumn,
  saveBoard,
} from './storage';
import type {
  BoardData,
  BoardFilters,
  ColumnId,
  Priority,
  Task,
} from './types';
import { COLUMN_ORDER } from './types';

export const board = writable<BoardData>(createEmptyBoard());

export const filters = writable<BoardFilters>({
  search: '',
  priority: 'all',
  tag: 'all',
  due: 'all',
});

let persistEnabled = false;

export function initBoard(): void {
  board.set(loadBoard());
  persistEnabled = true;
  board.subscribe((value) => {
    if (!persistEnabled) return;
    saveBoard(value);
  });
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function taskMatchesFilters(
  task: Task,
  active: BoardFilters,
): boolean {
  const query = active.search.trim().toLowerCase();
  if (query) {
    const haystack = `${task.text} ${task.tags.join(' ')}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  if (active.priority !== 'all' && task.priority !== active.priority) {
    return false;
  }

  if (active.tag !== 'all' && !task.tags.includes(active.tag)) {
    return false;
  }

  if (active.due !== 'all') {
    if (active.due === 'none' && task.dueDate) return false;
    if (active.due === 'overdue') {
      if (!task.dueDate || task.dueDate >= todayIso()) return false;
    }
    if (active.due === 'upcoming') {
      if (!task.dueDate || task.dueDate < todayIso()) return false;
    }
  }

  return true;
}

export const allTags = derived(board, ($board) => {
  const tags = new Set<string>();
  for (const columnId of COLUMN_ORDER) {
    for (const task of $board.columns[columnId]) {
      for (const tag of task.tags) tags.add(tag);
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
});

export function getFilteredColumn(
  columnId: ColumnId,
  $board: BoardData,
  $filters: BoardFilters,
): Task[] {
  return $board.columns[columnId].filter((task) =>
    taskMatchesFilters(task, $filters),
  );
}

export function setColumnTasks(columnId: ColumnId, tasks: Task[]): void {
  board.update((current) => replaceColumn(current, columnId, tasks));
}

/** Merge a dragged/filtered list back into the full column order. */
export function applyFilteredColumnUpdate(
  columnId: ColumnId,
  nextVisible: Task[],
): void {
  const current = get(board);
  const activeFilters = get(filters);
  const full = current.columns[columnId];
  const visibleIds = new Set(
    full
      .filter((task) => taskMatchesFilters(task, activeFilters))
      .map((task) => task.id),
  );
  const hidden = full.filter((task) => !visibleIds.has(task.id));
  setColumnTasks(columnId, [...nextVisible, ...hidden]);
}

export function addTask(
  columnId: ColumnId,
  text: string,
  extras: Partial<Omit<Task, 'id' | 'text'>> = {},
): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  board.update((current) =>
    replaceColumn(current, columnId, [
      ...current.columns[columnId],
      createTask(trimmed, extras),
    ]),
  );
}

export function updateTask(
  columnId: ColumnId,
  taskId: string,
  patch: Partial<Omit<Task, 'id'>>,
): void {
  board.update((current) => {
    const tasks = current.columns[columnId].map((task) => {
      if (task.id !== taskId) return task;
      const next: Task = {
        ...task,
        ...patch,
        text: patch.text !== undefined ? patch.text.trim() : task.text,
        tags: patch.tags ?? task.tags,
      };
      if (patch.dueDate === '') {
        delete next.dueDate;
      }
      return next;
    });
    return replaceColumn(current, columnId, tasks);
  });
}

export function deleteTask(columnId: ColumnId, taskId: string): void {
  board.update((current) =>
    replaceColumn(
      current,
      columnId,
      current.columns[columnId].filter((task) => task.id !== taskId),
    ),
  );
}

export function replaceBoard(next: BoardData): void {
  board.set(next);
}

export function clearBoard(): void {
  board.set(createEmptyBoard());
}

export function setFilter<K extends keyof BoardFilters>(
  key: K,
  value: BoardFilters[K],
): void {
  filters.update((current) => ({ ...current, [key]: value }));
}

export function resetFilters(): void {
  filters.set({
    search: '',
    priority: 'all',
    tag: 'all',
    due: 'all',
  });
}

export function parseTags(input: string): string[] {
  return [
    ...new Set(
      input
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

export function priorityLabel(priority: Priority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}
