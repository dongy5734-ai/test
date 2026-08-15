const listEl = document.getElementById("todo-list");
const emptyEl = document.getElementById("empty-state");
const formEl = document.getElementById("new-todo-form");
const inputEl = document.getElementById("new-todo-input");

async function api(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

function render(todos) {
  listEl.innerHTML = "";
  emptyEl.hidden = todos.length > 0;

  for (const todo of todos) {
    const item = document.createElement("li");
    item.className = `todo-item${todo.done ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => toggle(todo.id));

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = todo.title;

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "\u2715";
    del.setAttribute("aria-label", `Delete ${todo.title}`);
    del.addEventListener("click", () => remove(todo.id));

    item.append(checkbox, title, del);
    listEl.append(item);
  }
}

async function refresh() {
  render(await api("/api/todos"));
}

async function toggle(id) {
  await api(`/api/todos/${id}/toggle`, { method: "POST" });
  await refresh();
}

async function remove(id) {
  await api(`/api/todos/${id}`, { method: "DELETE" });
  await refresh();
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = inputEl.value.trim();
  if (!title) {
    return;
  }
  await api("/api/todos", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  inputEl.value = "";
  inputEl.focus();
  await refresh();
});

refresh().catch((err) => {
  console.error(err);
});
