# test

A minimal [Express](https://expressjs.com/) todo application used to bootstrap and
demonstrate the Cloud Agent development environment end to end.

## Requirements

- Node.js >= 20 (the Cloud Agent image ships Node 22)

## Getting started

```bash
npm ci        # install dependencies
npm run dev   # start the dev server with auto-reload on http://localhost:3000
```

`npm start` runs the server without the file watcher.

## Project layout

```
src/
  server.js   Express app factory + HTTP entrypoint
  todos.js    In-memory todo store (unit tested in isolation)
public/       Static frontend (HTML/CSS/JS todo UI)
test/         Node built-in test runner suites
```

## Common commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the server with `--watch` auto-reload |
| `npm start` | Start the server |
| `npm test` | Run the `node --test` suites |
| `npm run lint` | Lint with ESLint |

## HTTP API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health/uptime probe |
| `GET` | `/api/todos` | List todos |
| `POST` | `/api/todos` | Create a todo (`{ "title": "..." }`) |
| `POST` | `/api/todos/:id/toggle` | Toggle a todo's done state |
| `DELETE` | `/api/todos/:id` | Delete a todo |

## Cloud Agent environment

`.cursor/environment.json` installs dependencies with `npm ci` and runs the dev
server in a persistent `dev-server` terminal on port 3000.
