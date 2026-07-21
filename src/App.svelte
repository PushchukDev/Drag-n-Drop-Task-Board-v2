<script lang="ts">
  import Board from './components/Board.svelte';
  import Toolbar from './components/Toolbar.svelte';
</script>

<div class="shell">
  <header class="hero">
    <p class="eyebrow">Local-first</p>
    <h1>Task Board</h1>
    <p class="lede">
      Plan work across four columns. Everything stays in your browser —
      nothing is sent to a server.
    </p>
  </header>

  <Toolbar />
  <Board />
</div>

<style>
  .shell {
    width: min(1280px, calc(100% - 2rem));
    margin: 0 auto;
    padding: 2rem 0 3rem;
  }

  .hero {
    margin-bottom: 1.5rem;
    animation: column-enter 420ms ease both;
  }

  .eyebrow {
    margin: 0 0 0.35rem;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
  }

  h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(2.4rem, 5vw, 3.4rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.05;
  }

  .lede {
    margin: 0.65rem 0 0;
    max-width: 36rem;
    color: var(--ink-muted);
    font-size: 1.05rem;
  }
</style>
