export type Priority = 'low' | 'medium' | 'high';

export type ColumnId = 'backlog' | 'progress' | 'complete' | 'onHold';

export type DueFilter = 'all' | 'overdue' | 'upcoming' | 'none';

export interface Task {
  id: string;
  text: string;
  priority: Priority;
  dueDate?: string;
  tags: string[];
}

export interface BoardData {
  version: 1;
  columns: Record<ColumnId, Task[]>;
}

export interface BoardFilters {
  search: string;
  priority: Priority | 'all';
  tag: string | 'all';
  due: DueFilter;
}

export type ThemeMode = 'light' | 'dark';

export const COLUMN_ORDER: ColumnId[] = [
  'backlog',
  'progress',
  'complete',
  'onHold',
];

export const COLUMN_LABELS: Record<ColumnId, string> = {
  backlog: 'Backlog',
  progress: 'Progress',
  complete: 'Complete',
  onHold: 'On Hold',
};

export const STORAGE_KEY = 'kanban-board-v1';
export const THEME_KEY = 'kanban-theme';

export const LEGACY_KEYS: Record<ColumnId, string> = {
  backlog: 'backlogItems',
  progress: 'progressItems',
  complete: 'completeItems',
  onHold: 'onHoldItems',
};
