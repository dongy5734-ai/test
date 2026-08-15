import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = process.env.DATA_FILE ?? join(__dirname, "data.json");
const PORT = Number(process.env.API_PORT ?? 3001);

const SEED_TASKS = [
  { title: "Welcome to your Task Board", done: true },
  { title: "Add a task using the field above", done: false },
  { title: "Toggle a task to mark it complete", done: false },
];

async function loadTasks() {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // File missing or invalid: fall through to seed.
  }
  const seeded = SEED_TASKS.map((t) => ({
    id: randomUUID(),
    title: t.title,
    done: t.done,
    createdAt: new Date().toISOString(),
  }));
  await saveTasks(seeded);
  return seeded;
}

async function saveTasks(tasks) {
  await mkdir(dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), "utf8");
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/api/tasks", async (_req, res) => {
  const tasks = await loadTasks();
  res.json(tasks);
});

app.post("/api/tasks", async (req, res) => {
  const title = String(req.body?.title ?? "").trim();
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }
  const tasks = await loadTasks();
  const task = {
    id: randomUUID(),
    title,
    done: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  await saveTasks(tasks);
  res.status(201).json(task);
});

app.patch("/api/tasks/:id", async (req, res) => {
  const tasks = await loadTasks();
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: "task not found" });
  }
  if (typeof req.body?.done === "boolean") task.done = req.body.done;
  if (typeof req.body?.title === "string" && req.body.title.trim()) {
    task.title = req.body.title.trim();
  }
  await saveTasks(tasks);
  res.json(task);
});

app.delete("/api/tasks/:id", async (req, res) => {
  const tasks = await loadTasks();
  const next = tasks.filter((t) => t.id !== req.params.id);
  if (next.length === tasks.length) {
    return res.status(404).json({ error: "task not found" });
  }
  await saveTasks(next);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`[api] Task Board API listening on http://localhost:${PORT}`);
});
