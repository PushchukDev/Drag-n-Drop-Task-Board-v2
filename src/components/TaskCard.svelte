<script lang="ts">
  import { deleteTask, priorityLabel, updateTask } from '../lib/board';
  import type { ColumnId, Priority, Task } from '../lib/types';

  interface Props {
    columnId: ColumnId;
    task: Task;
  }

  let { columnId, task }: Props = $props();

  let editing = $state(false);
  let draftText = $state('');
  let draftPriority = $state<Priority>('medium');
  let draftDue = $state('');
  let draftTags = $state('');

  function startEdit() {
    editing = true;
    draftText = task.text;
    draftPriority = task.priority;
    draftDue = task.dueDate ?? '';
    draftTags = task.tags.join(', ');
  }

  function cancelEdit() {
    editing = false;
  }

  function saveEdit() {
    const text = draftText.trim();
    if (!text) {
      deleteTask(columnId, task.id);
      return;
    }
    updateTask(columnId, task.id, {
      text,
      priority: draftPriority,
      dueDate: draftDue,
      tags: draftTags
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    });
    editing = false;
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit();
    }
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      saveEdit();
    }
  }

  let dueLabel = $derived.by(() => {
    if (!task.dueDate) return '';
    const today = new Date().toISOString().slice(0, 10);
    if (task.dueDate < today) return `Overdue · ${task.dueDate}`;
    if (task.dueDate === today) return `Due today`;
    return `Due ${task.dueDate}`;
  });

  let overdue = $derived(
    Boolean(task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10)),
  );
</script>

<article class="card priority-{task.priority}" class:overdue>
  {#if editing}
    <form
      class="edit"
      onsubmit={(event) => {
        event.preventDefault();
        saveEdit();
      }}
    >
      <label>
        <span class="sr-only">Task text</span>
        <textarea
          bind:value={draftText}
          rows="3"
          onkeydown={onKeydown}
        ></textarea>
      </label>
      <div class="meta-fields">
        <label>
          <span>Priority</span>
          <select bind:value={draftPriority}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label>
          <span>Due</span>
          <input type="date" bind:value={draftDue} />
        </label>
      </div>
      <label>
        <span>Tags (comma separated)</span>
        <input
          type="text"
          bind:value={draftTags}
          placeholder="design, ops"
          onkeydown={onKeydown}
        />
      </label>
      <div class="actions">
        <button type="submit" class="solid">Save</button>
        <button type="button" class="ghost" onclick={cancelEdit}>Cancel</button>
        <button
          type="button"
          class="danger"
          onclick={() => deleteTask(columnId, task.id)}
        >
          Delete
        </button>
      </div>
      <p class="hint">Ctrl/Cmd+Enter to save · Esc to cancel</p>
    </form>
  {:else}
    <button type="button" class="body" onclick={startEdit}>
      <p class="text">{task.text}</p>
      <div class="meta">
        <span class="badge priority">{priorityLabel(task.priority)}</span>
        {#if dueLabel}
          <span class="badge due">{dueLabel}</span>
        {/if}
      </div>
      {#if task.tags.length}
        <ul class="tags">
          {#each task.tags as tag (tag)}
            <li>{tag}</li>
          {/each}
        </ul>
      {/if}
    </button>
  {/if}
</article>

<style>
  .card {
    border: 1px solid var(--line);
    border-left: 4px solid var(--priority-color, var(--line));
    border-radius: 10px;
    background: color-mix(in srgb, var(--paper) 70%, var(--paper-elevated));
    transition:
      transform var(--transition),
      box-shadow var(--transition),
      border-color var(--transition);
  }

  .card:hover {
    box-shadow: var(--shadow);
  }

  .priority-low {
    --priority-color: var(--priority-low);
  }
  .priority-medium {
    --priority-color: var(--priority-medium);
  }
  .priority-high {
    --priority-color: var(--priority-high);
  }

  .card.overdue .due {
    color: var(--danger);
    background: var(--danger-soft);
  }

  .body {
    display: grid;
    gap: 0.55rem;
    width: 100%;
    padding: 0.8rem;
    border: 0;
    background: transparent;
    text-align: left;
    cursor: grab;
  }

  .body:active {
    cursor: grabbing;
  }

  .text {
    margin: 0;
    font-weight: 560;
    line-height: 1.35;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .badge {
    padding: 0.15rem 0.45rem;
    border-radius: 999px;
    background: var(--accent-soft);
    color: var(--accent-ink);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .badge.priority {
    background: color-mix(in srgb, var(--priority-color) 18%, transparent);
    color: var(--priority-color);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .tags li {
    padding: 0.1rem 0.4rem;
    border-radius: 6px;
    border: 1px solid var(--line);
    font-size: 0.75rem;
    color: var(--ink-muted);
  }

  .edit {
    display: grid;
    gap: 0.55rem;
    padding: 0.8rem;
  }

  .edit label {
    display: grid;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--ink-muted);
  }

  .meta-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  textarea,
  input,
  select {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--paper-elevated);
    padding: 0.5rem 0.6rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .actions button {
    border-radius: 8px;
    border: 1px solid var(--line);
    padding: 0.4rem 0.7rem;
    font-weight: 600;
  }

  .solid {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--paper-elevated);
  }

  .ghost {
    background: transparent;
  }

  .danger {
    margin-left: auto;
    background: var(--danger-soft);
    border-color: transparent;
    color: var(--danger);
  }

  .hint {
    margin: 0;
    font-size: 0.72rem;
    color: var(--ink-muted);
  }
</style>
