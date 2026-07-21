# Task Board

A local-first Kanban board built with **Svelte 5**, **Vite**, and **TypeScript**. Drag tasks between Backlog, Progress, Complete, and On Hold. Data stays in your browser via `localStorage` — nothing is sent to a server.

## Features

- Drag and drop between columns
- Add, edit, and delete tasks
- Priority, optional due date, and tags
- Search and filters (priority, tag, due status)
- Light / dark theme (follows system preference by default)
- Export / import the board as JSON
- Migrates data from the previous vanilla `localStorage` keys if present

## Quick start

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build
npm run check    # TypeScript + svelte-check
```

## Security hygiene

This app does **not** need API keys, tokens, or credentials.

- Never commit `.env` files, private keys, or service-account JSON
- `.env` is gitignored; use `.env.example` only as a commented template if you add `VITE_*` vars later
- Prefer your GitHub noreply address for commits:  
  `git config user.email "<id>+<username>@users.noreply.github.com"`
- Do not paste secrets into sample tasks, README snippets, or screenshots

## Deploy

Live site: [https://pushchukdev.github.io/Drag-n-Drop-Task-Board-v2/](https://pushchukdev.github.io/Drag-n-Drop-Task-Board-v2/)

Pushes to `master` build and publish via GitHub Actions (`.github/workflows/deploy.yml`).

One-time setup in the repo:

1. Go to **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**

The repository must be public (or on a GitHub plan that allows private Pages).

## Data

Board state is stored under the `kanban-board-v1` key in `localStorage`. Theme preference uses `kanban-theme`.

## License

Use and adapt freely for personal or learning projects.

