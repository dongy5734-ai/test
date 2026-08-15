import assert from "node:assert/strict";
import { test } from "node:test";
import { createTodoStore } from "../src/todos.js";

test("seeds initial todos", () => {
  const store = createTodoStore(["first", "second"]);
  const todos = store.list();
  assert.equal(todos.length, 2);
  assert.equal(todos[0].title, "first");
  assert.equal(todos[0].done, false);
});

test("adds a trimmed todo", () => {
  const store = createTodoStore();
  const todo = store.add("  write tests  ");
  assert.equal(todo.title, "write tests");
  assert.equal(store.list().length, 1);
});

test("rejects an empty title", () => {
  const store = createTodoStore();
  assert.throws(() => store.add("   "), /title is required/);
  assert.equal(store.list().length, 0);
});

test("toggles done state", () => {
  const store = createTodoStore();
  const { id } = store.add("toggle me");
  assert.equal(store.toggle(id).done, true);
  assert.equal(store.toggle(id).done, false);
  assert.equal(store.toggle(999), null);
});

test("removes a todo", () => {
  const store = createTodoStore();
  const { id } = store.add("delete me");
  assert.equal(store.remove(id), true);
  assert.equal(store.remove(id), false);
  assert.equal(store.list().length, 0);
});
