<script lang="ts">
  import { parseTags } from '../lib/board';
  import type { Priority } from '../lib/types';

  interface Props {
    onsubmit: (payload: {
      text: string;
      priority: Priority;
      dueDate: string;
      tags: string[];
    }) => void;
    oncancel: () => void;
  }

  let { onsubmit, oncancel }: Props = $props();

  let text = $state('');
  let priority = $state<Priority>('medium');
  let dueDate = $state('');
  let tags = $state('');

  function submit() {
    if (!text.trim()) return;
    onsubmit({
      text,
      priority,
      dueDate,
      tags: parseTags(tags),
    });
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      oncancel();
    }
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submit();
    }
  }
</script>

<form
  class="form"
  onsubmit={(event) => {
    event.preventDefault();
    submit();
  }}
>
  <label>
    <span class="sr-only">New task</span>
    <textarea
      bind:value={text}
      rows="3"
      placeholder="What needs doing?"
      required
      onkeydown={onKeydown}
    ></textarea>
  </label>

  <div class="row">
    <label>
      <span>Priority</span>
      <select bind:value={priority}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </label>
    <label>
      <span>Due date</span>
      <input type="date" bind:value={dueDate} />
    </label>
  </div>

  <label>
    <span>Tags</span>
    <input type="text" bind:value={tags} placeholder="planning, design" onkeydown={onKeydown} />
  </label>

  <div class="actions">
    <button type="submit" class="solid">Save item</button>
    <button type="button" class="ghost" onclick={oncancel}>Cancel</button>
  </div>
</form>

<style>
  .form {
    display: grid;
    gap: 0.55rem;
    padding: 0.75rem;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: color-mix(in srgb, var(--accent-soft) 45%, var(--paper-elevated));
  }

  label {
    display: grid;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--ink-muted);
  }

  .row {
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
    color: var(--ink);
  }

  .actions {
    display: flex;
    gap: 0.45rem;
  }

  button {
    border-radius: 8px;
    border: 1px solid var(--line);
    padding: 0.45rem 0.75rem;
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
</style>
