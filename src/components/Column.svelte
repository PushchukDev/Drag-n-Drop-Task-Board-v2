<script lang="ts">
  import { flip } from 'svelte/animate';
  import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
  import {
    addTask,
    applyFilteredColumnUpdate,
    filters,
    taskMatchesFilters,
  } from '../lib/board';
  import type { ColumnId, Task } from '../lib/types';
  import TaskCard from './TaskCard.svelte';
  import TaskForm from './TaskForm.svelte';

  interface Props {
    columnId: ColumnId;
    title: string;
    tasks: Task[];
    style?: string;
  }

  let { columnId, title, tasks, style = '' }: Props = $props();

  const flipDurationMs = 180;
  let showForm = $state(false);
  let dragging = $state(false);

  let visibleTasks = $derived(
    tasks.filter((task) => taskMatchesFilters(task, $filters)),
  );

  // Local mirror for dndzone intermediate updates
  let items = $state<Task[]>([]);

  $effect(() => {
    if (dragging) return;
    items = visibleTasks;
  });

  function withoutShadowItems(list: Task[]): Task[] {
    return list.filter((item) => {
      const record = item as unknown as Record<string | symbol, unknown>;
      return !record[SHADOW_ITEM_MARKER_PROPERTY_NAME];
    });
  }

  function handleConsider(event: CustomEvent<{ items: Task[] }>) {
    dragging = true;
    items = event.detail.items;
  }

  function handleFinalize(event: CustomEvent<{ items: Task[] }>) {
    items = withoutShadowItems(event.detail.items);
    applyFilteredColumnUpdate(columnId, items);
    dragging = false;
  }

  function onAdd(payload: {
    text: string;
    priority: Task['priority'];
    dueDate: string;
    tags: string[];
  }) {
    addTask(columnId, payload.text, {
      priority: payload.priority,
      dueDate: payload.dueDate || undefined,
      tags: payload.tags,
    });
    showForm = false;
  }
</script>

<section class="column column-{columnId}" {style} aria-labelledby="{columnId}-title">
  <header class="header">
    <h2 id="{columnId}-title">{title}</h2>
    <span class="count" aria-label="{visibleTasks.length} tasks">
      {visibleTasks.length}
    </span>
  </header>

  <ul
    class="list custom-scroll"
    use:dndzone={{
      items,
      flipDurationMs,
      type: 'tasks',
      dropTargetStyle: {
        outline: '2px dashed var(--accent)',
        outlineOffset: '4px',
      },
    }}
    onconsider={handleConsider}
    onfinalize={handleFinalize}
  >
    {#each items as task (task.id)}
      <li animate:flip={{ duration: flipDurationMs }} class="item">
        <TaskCard {columnId} {task} />
      </li>
    {/each}
  </ul>

  {#if showForm}
    <TaskForm
      onsubmit={onAdd}
      oncancel={() => {
        showForm = false;
      }}
    />
  {:else}
    <button type="button" class="add" onclick={() => (showForm = true)}>
      <span aria-hidden="true">+</span> Add item
    </button>
  {/if}
</section>

<style>
  .column {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-height: 18rem;
    padding: 0.9rem;
    background: var(--paper-elevated);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    animation: column-enter 500ms ease both;
    animation-delay: var(--delay, 0ms);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding-bottom: 0.35rem;
    border-bottom: 3px solid var(--col-accent, var(--accent));
  }

  .column-backlog {
    --col-accent: var(--col-backlog);
  }
  .column-progress {
    --col-accent: var(--col-progress);
  }
  .column-complete {
    --col-accent: var(--col-complete);
  }
  .column-onHold {
    --col-accent: var(--col-onHold);
  }

  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 700;
  }

  .count {
    min-width: 1.6rem;
    padding: 0.15rem 0.45rem;
    border-radius: 999px;
    background: var(--accent-soft);
    color: var(--accent-ink);
    font-size: 0.8rem;
    font-weight: 700;
    text-align: center;
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0.15rem;
    min-height: 6rem;
    max-height: min(58vh, 34rem);
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .item {
    margin: 0;
  }

  .add {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    width: 100%;
    padding: 0.65rem;
    border: 1px dashed var(--line);
    border-radius: 8px;
    background: transparent;
    color: var(--ink-muted);
    font-weight: 600;
  }

  .add:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .custom-scroll {
    scrollbar-width: thin;
    scrollbar-color: var(--line) transparent;
  }
</style>
