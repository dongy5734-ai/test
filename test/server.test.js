import assert from "node:assert/strict";
import { test } from "node:test";
import { createApp } from "../src/server.js";
import { createTodoStore } from "../src/todos.js";

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, base: `http://127.0.0.1:${port}` });
    });
  });
}

test("health endpoint responds ok", async () => {
  const { server, base } = await listen(createApp(createTodoStore()));
  try {
    const res = await fetch(`${base}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
  } finally {
    server.close();
  }
});

test("creates and lists a todo over HTTP", async () => {
  const { server, base } = await listen(createApp(createTodoStore()));
  try {
    const created = await fetch(`${base}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "end to end" }),
    });
    assert.equal(created.status, 201);

    const list = await (await fetch(`${base}/api/todos`)).json();
    assert.equal(list.length, 1);
    assert.equal(list[0].title, "end to end");
  } finally {
    server.close();
  }
});

test("rejects an empty todo title over HTTP", async () => {
  const { server, base } = await listen(createApp(createTodoStore()));
  try {
    const res = await fetch(`${base}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "" }),
    });
    assert.equal(res.status, 400);
  } finally {
    server.close();
  }
});
