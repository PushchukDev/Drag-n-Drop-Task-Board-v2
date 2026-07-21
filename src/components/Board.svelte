<script lang="ts">
  import { board } from '../lib/board';
  import { COLUMN_LABELS, COLUMN_ORDER, type ColumnId } from '../lib/types';
  import Column from './Column.svelte';
</script>

<section class="board" aria-label="Kanban board">
  {#each COLUMN_ORDER as columnId, index (columnId)}
    <Column
      columnId={columnId}
      title={COLUMN_LABELS[columnId]}
      tasks={$board.columns[columnId]}
      style="--delay: {index * 70}ms"
    />
  {/each}
</section>

<style>
  .board {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
    align-items: start;
  }

  @media (max-width: 1100px) {
    .board {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .board {
      grid-template-columns: 1fr;
    }
  }
</style>
