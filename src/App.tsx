import { useEffect, useMemo, useState } from "react";
import "./App.css";

interface Task {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
}

type Filter = "all" | "active" | "done";

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Task[]>("/api/tasks")
      .then(setTasks)
      .catch(() => setError("Could not reach the API server."))
      .finally(() => setLoading(false));
  }, []);

  const remaining = useMemo(() => tasks.filter((t) => !t.done).length, [tasks]);

  const visible = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.done);
    if (filter === "done") return tasks.filter((t) => t.done);
    return tasks;
  }, [tasks, filter]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    try {
      const created = await api<Task>("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title: value }),
      });
      setTasks((prev) => [...prev, created]);
      setTitle("");
    } catch {
      setError("Could not add the task.");
    }
  }

  async function toggle(task: Task) {
    try {
      const updated = await api<Task>(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ done: !task.done }),
      });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      setError("Could not update the task.");
    }
  }

  async function remove(task: Task) {
    try {
      await api<void>(`/api/tasks/${task.id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch {
      setError("Could not delete the task.");
    }
  }

  return (
    <div className="app">
      <div className="card">
        <header className="header">
          <h1>Task Board</h1>
          <p className="subtitle">
            {remaining} {remaining === 1 ? "task" : "tasks"} remaining
          </p>
        </header>

        <form className="add-form" onSubmit={addTask}>
          <input
            className="add-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            aria-label="New task title"
          />
          <button className="add-button" type="submit">
            Add
          </button>
        </form>

        <div className="filters">
          {(["all", "active", "done"] as Filter[]).map((f) => (
            <button
              key={f}
              className={`filter ${filter === f ? "filter--active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="empty">Loading tasks…</p>
        ) : visible.length === 0 ? (
          <p className="empty">Nothing here yet.</p>
        ) : (
          <ul className="list">
            {visible.map((task) => (
              <li key={task.id} className={`item ${task.done ? "item--done" : ""}`}>
                <label className="item-main">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggle(task)}
                  />
                  <span className="item-title">{task.title}</span>
                </label>
                <button
                  className="delete"
                  onClick={() => remove(task)}
                  aria-label={`Delete ${task.title}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <footer className="footer">
        Vite + React + TypeScript · Express API
      </footer>
    </div>
  );
}
