import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { rm } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 4567;
const BASE = `http://localhost:${PORT}`;
const DATA_FILE = join(__dirname, "data.test.json");

let child;

async function waitForHealth(timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return;
    } catch {
      // Server not up yet.
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("API did not become healthy in time");
}

before(async () => {
  await rm(DATA_FILE, { force: true });
  child = spawn("node", [join(__dirname, "index.js")], {
    env: { ...process.env, API_PORT: String(PORT), DATA_FILE },
    stdio: "ignore",
  });
  await waitForHealth();
});

after(async () => {
  child?.kill();
  await rm(DATA_FILE, { force: true });
});

test("seeds tasks on first load", async () => {
  const res = await fetch(`${BASE}/api/tasks`);
  const tasks = await res.json();
  assert.ok(Array.isArray(tasks));
  assert.ok(tasks.length >= 1);
});

test("creates, toggles, and deletes a task", async () => {
  const createRes = await fetch(`${BASE}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Write integration test" }),
  });
  assert.equal(createRes.status, 201);
  const created = await createRes.json();
  assert.equal(created.title, "Write integration test");
  assert.equal(created.done, false);

  const toggleRes = await fetch(`${BASE}/api/tasks/${created.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done: true }),
  });
  const toggled = await toggleRes.json();
  assert.equal(toggled.done, true);

  const delRes = await fetch(`${BASE}/api/tasks/${created.id}`, {
    method: "DELETE",
  });
  assert.equal(delRes.status, 204);

  const listRes = await fetch(`${BASE}/api/tasks`);
  const tasks = await listRes.json();
  assert.ok(!tasks.some((t) => t.id === created.id));
});

test("rejects empty task title", async () => {
  const res = await fetch(`${BASE}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "   " }),
  });
  assert.equal(res.status, 400);
});
