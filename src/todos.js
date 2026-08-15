// In-memory todo store. Kept separate from the HTTP layer so it can be unit tested
// without starting a server.

export function createTodoStore(seed = []) {
  let nextId = 1;
  const todos = new Map();

  for (const title of seed) {
    const id = nextId++;
    todos.set(id, { id, title, done: false });
  }

  return {
    list() {
      return [...todos.values()];
    },

    add(title) {
      const trimmed = typeof title === "string" ? title.trim() : "";
      if (!trimmed) {
        throw new Error("title is required");
      }
      const id = nextId++;
      const todo = { id, title: trimmed, done: false };
      todos.set(id, todo);
      return todo;
    },

    toggle(id) {
      const todo = todos.get(id);
      if (!todo) {
        return null;
      }
      todo.done = !todo.done;
      return todo;
    },

    remove(id) {
      return todos.delete(id);
    },
  };
}
