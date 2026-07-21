import type { BoardData, ColumnId, Priority, Task } from './types';
import { COLUMN_ORDER, LEGACY_KEYS, STORAGE_KEY } from './types';

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createTask(
  text: string,
  extras: Partial<Omit<Task, 'id' | 'text'>> = {},
): Task {
  return {
    id: createId(),
    text: text.trim(),
    priority: extras.priority ?? 'medium',
    dueDate: extras.dueDate,
    tags: extras.tags ?? [],
  };
}

export function createEmptyBoard(): BoardData {
  return {
    version: 1,
    columns: {
      backlog: [],
      progress: [],
      complete: [],
      onHold: [],
    },
  };
}

export function createSeedBoard(): BoardData {
  return {
    version: 1,
    columns: {
      backlog: [
        createTask('Sketch the project outline', {
          priority: 'high',
          tags: ['planning'],
        }),
        createTask('Gather reference materials', {
          priority: 'medium',
          tags: ['research'],
          dueDate: daysFromNow(5),
        }),
      ],
      progress: [
        createTask('Build the board layout', {
          priority: 'high',
          tags: ['dev'],
          dueDate: daysFromNow(2),
        }),
        createTask('Wire up local persistence', {
          priority: 'medium',
          tags: ['dev'],
        }),
      ],
      complete: [
        createTask('Choose the visual direction', {
          priority: 'low',
          tags: ['design'],
        }),
      ],
      onHold: [
        createTask('Explore optional cloud sync', {
          priority: 'low',
          tags: ['future'],
        }),
      ],
    },
  };
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function isPriority(value: unknown): value is Priority {
  return value === 'low' || value === 'medium' || value === 'high';
}

function normalizeTask(raw: unknown): Task | null {
  if (typeof raw === 'string') {
    const text = raw.trim();
    return text ? createTask(text) : null;
  }

  if (!raw || typeof raw !== 'object') return null;

  const candidate = raw as Record<string, unknown>;
  const text = typeof candidate.text === 'string' ? candidate.text.trim() : '';
  if (!text) return null;

  const tags = Array.isArray(candidate.tags)
    ? candidate.tags
        .filter((tag): tag is string => typeof tag === 'string')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  return {
    id:
      typeof candidate.id === 'string' && candidate.id
        ? candidate.id
        : createId(),
    text,
    priority: isPriority(candidate.priority) ? candidate.priority : 'medium',
    dueDate:
      typeof candidate.dueDate === 'string' && candidate.dueDate
        ? candidate.dueDate
        : undefined,
    tags,
  };
}

function normalizeBoard(raw: unknown): BoardData | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Record<string, unknown>;
  const columnsRaw = candidate.columns;

  if (!columnsRaw || typeof columnsRaw !== 'object') return null;

  const columns = createEmptyBoard().columns;
  for (const columnId of COLUMN_ORDER) {
    const list = (columnsRaw as Record<string, unknown>)[columnId];
    if (!Array.isArray(list)) continue;
    columns[columnId] = list
      .map(normalizeTask)
      .filter((task): task is Task => task !== null);
  }

  return { version: 1, columns };
}

function migrateLegacyBoard(): BoardData | null {
  if (typeof localStorage === 'undefined') return null;

  const hasLegacy = COLUMN_ORDER.some(
    (columnId) => localStorage.getItem(LEGACY_KEYS[columnId]) !== null,
  );
  if (!hasLegacy) return null;

  const board = createEmptyBoard();
  for (const columnId of COLUMN_ORDER) {
    const raw = localStorage.getItem(LEGACY_KEYS[columnId]);
    if (!raw) continue;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;
      board.columns[columnId] = parsed
        .map(normalizeTask)
        .filter((task): task is Task => task !== null);
    } catch {
      // Ignore corrupt legacy values and continue.
    }
  }

  return board;
}

export function loadBoard(): BoardData {
  if (typeof localStorage === 'undefined') {
    return createSeedBoard();
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const normalized = normalizeBoard(JSON.parse(raw));
      if (normalized) return normalized;
    } catch {
      // Fall through to legacy / seed.
    }
  }

  const legacy = migrateLegacyBoard();
  if (legacy) {
    saveBoard(legacy);
    return legacy;
  }

  return createSeedBoard();
}

export function saveBoard(board: BoardData): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}

export function replaceColumn(
  board: BoardData,
  columnId: ColumnId,
  tasks: Task[],
): BoardData {
  return {
    ...board,
    columns: {
      ...board.columns,
      [columnId]: tasks,
    },
  };
}
