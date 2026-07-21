<script lang="ts">
  import { get } from 'svelte/store';
  import {
    allTags,
    board,
    filters,
    resetFilters,
    setFilter,
  } from '../lib/board';
  import { downloadBoard, readBoardFile } from '../lib/exportImport';
  import { theme, toggleTheme } from '../lib/theme';
  import type { DueFilter, Priority } from '../lib/types';

  let fileInput: HTMLInputElement;
  let importError = $state('');

  async function onImport(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    importError = '';
    if (!file) return;
    try {
      const next = await readBoardFile(file);
      board.set(next);
    } catch (error) {
      importError =
        error instanceof Error ? error.message : 'Could not import board.';
    } finally {
      input.value = '';
    }
  }

  function onExport() {
    downloadBoard(get(board));
  }
</script>

<section class="toolbar" aria-label="Board controls">
  <div class="row search-row">
    <label class="field grow">
      <span class="label">Search</span>
      <input
        type="search"
        placeholder="Search tasks or tags"
        value={$filters.search}
        oninput={(event) =>
          setFilter('search', (event.currentTarget as HTMLInputElement).value)}
      />
    </label>

    <label class="field">
      <span class="label">Priority</span>
      <select
        value={$filters.priority}
        onchange={(event) =>
          setFilter(
            'priority',
            (event.currentTarget as HTMLSelectElement).value as
              | Priority
              | 'all',
          )}
      >
        <option value="all">All</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </label>

    <label class="field">
      <span class="label">Tag</span>
      <select
        value={$filters.tag}
        onchange={(event) =>
          setFilter(
            'tag',
            (event.currentTarget as HTMLSelectElement).value as string | 'all',
          )}
      >
        <option value="all">All</option>
        {#each $allTags as tag (tag)}
          <option value={tag}>{tag}</option>
        {/each}
      </select>
    </label>

    <label class="field">
      <span class="label">Due</span>
      <select
        value={$filters.due}
        onchange={(event) =>
          setFilter(
            'due',
            (event.currentTarget as HTMLSelectElement).value as DueFilter,
          )}
      >
        <option value="all">All</option>
        <option value="overdue">Overdue</option>
        <option value="upcoming">Upcoming</option>
        <option value="none">No date</option>
      </select>
    </label>
  </div>

  <div class="row actions-row">
    <button type="button" class="ghost" onclick={resetFilters}>
      Clear filters
    </button>
    <button type="button" class="ghost" onclick={toggleTheme}>
      {$theme === 'light' ? 'Dark theme' : 'Light theme'}
    </button>
    <button type="button" class="solid" onclick={onExport}>Export JSON</button>
    <button type="button" class="solid" onclick={() => fileInput.click()}>
      Import JSON
    </button>
    <input
      bind:this={fileInput}
      class="sr-only"
      type="file"
      accept="application/json,.json"
      onchange={onImport}
    />
  </div>

  {#if importError}
    <p class="error" role="alert">{importError}</p>
  {/if}
</section>

<style>
  .toolbar {
    display: grid;
    gap: 0.85rem;
    margin-bottom: 1.25rem;
    padding: 1rem;
    background: color-mix(in srgb, var(--paper-elevated) 88%, transparent);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    backdrop-filter: blur(8px);
    animation: column-enter 480ms ease both;
    animation-delay: 60ms;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: end;
  }

  .field {
    display: grid;
    gap: 0.3rem;
    min-width: 9rem;
  }

  .field.grow {
    flex: 1 1 14rem;
  }

  .label {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-muted);
  }

  input,
  select,
  button {
    border-radius: 8px;
    border: 1px solid var(--line);
    background: var(--paper-elevated);
    padding: 0.55rem 0.75rem;
  }

  button.solid {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--paper-elevated);
    font-weight: 600;
  }

  button.ghost {
    background: transparent;
  }

  .error {
    margin: 0;
    color: var(--danger);
    font-size: 0.9rem;
  }

  @media (max-width: 700px) {
    .actions-row {
      width: 100%;
    }

    .actions-row button {
      flex: 1 1 calc(50% - 0.75rem);
    }
  }
</style>
