# Task Board

A small full-stack **Task Board** app used to exercise and demonstrate the Cloud Agent development environment.

- **Frontend:** Vite + React + TypeScript (`src/`)
- **Backend:** Express REST API with JSON file persistence (`server/`)

## Getting started

```bash
npm install        # install dependencies
npm run dev        # run API (:3001) + web dev server (:5173) together
```

Then open http://localhost:5173. The web dev server proxies `/api/*` to the API on port 3001.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run the API and Vite dev server concurrently |
| `npm run dev:api` | Run only the Express API (`:3001`) |
| `npm run dev:web` | Run only the Vite dev server (`:5173`) |
| `npm run build` | Type-check and build the production frontend bundle |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm test` | Run the API integration tests (`node --test`) |

## API

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/tasks` | List tasks |
| `POST` | `/api/tasks` | Create a task (`{ "title": "..." }`) |
| `PATCH` | `/api/tasks/:id` | Update `done` and/or `title` |
| `DELETE` | `/api/tasks/:id` | Delete a task |

Tasks persist to `server/data.json` (git-ignored, seeded on first run).

## Cloud Agent environment

`.cursor/environment.json` defines the environment:

- `install`: `npm install`
- `terminals`: `api` (`npm run dev:api`) and `web` (`npm run dev:web`)
- `ports`: `5173` (web), `3001` (API)
