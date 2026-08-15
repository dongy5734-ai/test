import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createTodoStore } from "./todos.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(store = createTodoStore(["Try the Cloud Agent environment"])) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.get("/api/todos", (_req, res) => {
    res.json(store.list());
  });

  app.post("/api/todos", (req, res) => {
    try {
      const todo = store.add(req.body?.title);
      res.status(201).json(todo);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/todos/:id/toggle", (req, res) => {
    const todo = store.toggle(Number(req.params.id));
    if (!todo) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.json(todo);
  });

  app.delete("/api/todos/:id", (req, res) => {
    const removed = store.remove(Number(req.params.id));
    res.status(removed ? 204 : 404).end();
  });

  return app;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const port = Number(process.env.PORT) || 3000;
  createApp().listen(port, () => {
    console.log(`Todo app listening on http://localhost:${port}`);
  });
}
