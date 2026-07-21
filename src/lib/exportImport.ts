import { createEmptyBoard } from './storage';
import type { BoardData, Task } from './types';
import { COLUMN_ORDER } from './types';

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === 'string' &&
    typeof task.text === 'string' &&
    (task.priority === 'low' ||
      task.priority === 'medium' ||
      task.priority === 'high') &&
    Array.isArray(task.tags)
  );
}

export function serializeBoard(board: BoardData): string {
  return JSON.stringify(board, null, 2);
}

export function parseBoardJson(raw: string): BoardData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('File is not valid JSON.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Board file must be a JSON object.');
  }

  const candidate = parsed as Record<string, unknown>;
  const columnsRaw = candidate.columns;
  if (!columnsRaw || typeof columnsRaw !== 'object') {
    throw new Error('Board file is missing a columns object.');
  }

  const board = createEmptyBoard();
  for (const columnId of COLUMN_ORDER) {
    const list = (columnsRaw as Record<string, unknown>)[columnId];
    if (!Array.isArray(list)) {
      throw new Error(`Column "${columnId}" must be an array.`);
    }
    const tasks: Task[] = [];
    for (const item of list) {
      if (!isTask(item)) {
        throw new Error(`Invalid task in column "${columnId}".`);
      }
      tasks.push({
        id: item.id,
        text: item.text.trim(),
        priority: item.priority,
        dueDate: item.dueDate,
        tags: item.tags
          .filter((tag): tag is string => typeof tag === 'string')
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
    }
    board.columns[columnId] = tasks;
  }

  return board;
}

export function downloadBoard(board: BoardData): void {
  const blob = new Blob([serializeBoard(board)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `task-board-${stamp}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function readBoardFile(file: File): Promise<BoardData> {
  const text = await file.text();
  return parseBoardJson(text);
}
