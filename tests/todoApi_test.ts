import { assertEquals, assertNotEquals, assertRejects } from "@std/assert";
import {
  addTodo,
  completeTodoByName,
  deleteTodosByName,
  getTodoByName,
  getTodoDocByName,
  getTodos,
  modifyTodo,
} from "../src/todoApi.ts";
import { cleanupApiTestEnv, setupApiTestEnv } from "./test_utils.ts";

Deno.test("todoApi - addTodo creates a new todo", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Test task", { database: db });
    const todos = await getTodos(db);
    assertEquals(todos.length, 1);
    assertEquals(todos[0].value.task, "Test task");
    assertEquals(todos[0].value.completed, false);
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - addTodo creates todo with timestamps", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Test task", { database: db });
    const todos = await getTodos(db);
    assertEquals(todos.length, 1);
    assertEquals(typeof todos[0].value.createdAt, "string");
    assertEquals(todos[0].value.updatedAt, undefined);
    assertEquals(todos[0].value.completedAt, undefined);
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - getTodos returns all todos", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Task 1", { database: db });
    await addTodo("Task 2", { database: db });
    await addTodo("Task 3", { database: db });

    const todos = await getTodos(db);
    assertEquals(todos.length, 3);
    const tasks = todos.map((t) => t.value.task);
    assertEquals(tasks.includes("Task 1"), true);
    assertEquals(tasks.includes("Task 2"), true);
    assertEquals(tasks.includes("Task 3"), true);
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - getTodos returns empty array when no todos", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    const todos = await getTodos(db);
    assertEquals(todos.length, 0);
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - getTodoByName finds existing todo", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Find me", { database: db });
    const todo = await getTodoByName("Find me", db);
    assertEquals(todo.task, "Find me");
    assertEquals(todo.completed, false);
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - getTodoByName throws error for non-existent todo", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await assertRejects(
      async () => await getTodoByName("Does not exist", db),
      Error,
      'Todo with task "Does not exist" not found.',
    );
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - getTodoDocByName returns document", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Document test", { database: db });
    const todoDoc = await getTodoDocByName("Document test", db);
    assertEquals(todoDoc.value.task, "Document test");
    assertEquals(typeof todoDoc.id, "string");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - modifyTodo updates task and completion", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Original task", { database: db });
    const todoDoc = await getTodoDocByName("Original task", db);

    await modifyTodo(todoDoc.id, {
      task: "Updated task",
      completed: true,
      database: db,
    });

    const updated = await getTodoByName("Updated task", db);
    assertEquals(updated.task, "Updated task");
    assertEquals(updated.completed, true);
    assertEquals(typeof updated.updatedAt, "string");
    assertEquals(typeof updated.completedAt, "string");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - modifyTodo sets completedAt when completed", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Task to complete", { database: db });
    const todoDoc = await getTodoDocByName("Task to complete", db);

    await modifyTodo(todoDoc.id, {
      task: "Task to complete",
      completed: true,
      database: db,
    });

    const completed = await getTodoByName("Task to complete", db);
    assertEquals(completed.completed, true);
    assertEquals(typeof completed.completedAt, "string");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - modifyTodo clears completedAt when uncompleted", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Task", { database: db });
    const todoDoc = await getTodoDocByName("Task", db);

    // Complete it
    await modifyTodo(todoDoc.id, {
      task: "Task",
      completed: true,
      database: db,
    });
    let todo = await getTodoByName("Task", db);
    assertEquals(todo.completed, true);
    assertEquals(typeof todo.completedAt, "string");

    // Uncomplete it
    await modifyTodo(todoDoc.id, {
      task: "Task",
      completed: false,
      database: db,
    });
    todo = await getTodoByName("Task", db);
    assertEquals(todo.completed, false);
    assertEquals(todo.completedAt, undefined);
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - modifyTodo throws error for invalid ID", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await assertRejects(
      async () =>
        await modifyTodo("invalid-id", {
          task: "New task",
          completed: false,
          database: db,
        }),
      Error,
      "Failed to update todo with ID invalid-id",
    );
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - completeTodoByName marks todo as completed", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Task to complete", { database: db });
    await completeTodoByName("Task to complete", db);

    const todo = await getTodoByName("Task to complete", db);
    assertEquals(todo.completed, true);
    assertEquals(typeof todo.completedAt, "string");
    assertEquals(typeof todo.updatedAt, "string");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - deleteTodosByName removes single todo", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Delete me", { database: db });
    await addTodo("Keep me", { database: db });

    await deleteTodosByName(["Delete me"], db);

    const todos = await getTodos(db);
    assertEquals(todos.length, 1);
    assertEquals(todos[0].value.task, "Keep me");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - deleteTodosByName removes multiple todos", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Delete 1", { database: db });
    await addTodo("Delete 2", { database: db });
    await addTodo("Keep me", { database: db });

    await deleteTodosByName(["Delete 1", "Delete 2"], db);

    const todos = await getTodos(db);
    assertEquals(todos.length, 1);
    assertEquals(todos[0].value.task, "Keep me");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - deleteTodosByName handles non-existent todos gracefully", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Existing task", { database: db });

    // This should not throw
    await deleteTodosByName(["Non-existent task"], db);

    const todos = await getTodos(db);
    assertEquals(todos.length, 1);
    assertEquals(todos[0].value.task, "Existing task");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - todos have unique IDs", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Task 1", { database: db });
    await addTodo("Task 2", { database: db });

    const todos = await getTodos(db);
    const ids = todos.map((t) => t.value.id);
    assertNotEquals(ids[0], ids[1]);
    assertEquals(typeof ids[0], "string");
    assertEquals(typeof ids[1], "string");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - getTodoDocByName throws error for non-existent todo", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await assertRejects(
      async () => await getTodoDocByName("Does not exist", db),
      Error,
      'Todo with task "Does not exist" not found.',
    );
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

// Metadata tests
Deno.test("todoApi - addTodo creates todo with metadata fields", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Test task with metadata", {
      assignedTo: "agent-1",
      priority: "high",
      estimatedMinutes: 120,
      actualMinutes: 90,
      parentTaskId: "parent-123",
      tags: ["feature", "urgent"],
      database: db,
    });
    const todos = await getTodos(db);
    assertEquals(todos.length, 1);
    const todo = todos[0].value;
    assertEquals(todo.task, "Test task with metadata");
    assertEquals(todo.assignedTo, "agent-1");
    assertEquals(todo.priority, "high");
    assertEquals(todo.estimatedMinutes, 120);
    assertEquals(todo.actualMinutes, 90);
    assertEquals(todo.parentTaskId, "parent-123");
    assertEquals(todo.tags, ["feature", "urgent"]);
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - addTodo creates todo with partial metadata", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Test task", {
      priority: "medium",
      tags: ["backend"],
      database: db,
    });
    const todos = await getTodos(db);
    assertEquals(todos.length, 1);
    const todo = todos[0].value;
    assertEquals(todo.priority, "medium");
    assertEquals(todo.tags, ["backend"]);
    assertEquals(todo.assignedTo, undefined);
    assertEquals(todo.estimatedMinutes, undefined);
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - modifyTodo updates metadata fields", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Task to update", { database: db });
    const todoDoc = await getTodoDocByName("Task to update", db);

    await modifyTodo(todoDoc.id, {
      assignedTo: "agent-2",
      priority: "low",
      estimatedMinutes: 60,
      actualMinutes: 45,
      parentTaskId: "parent-456",
      tags: ["bugfix", "review"],
      database: db,
    });

    const updated = await getTodoByName("Task to update", db);
    assertEquals(updated.assignedTo, "agent-2");
    assertEquals(updated.priority, "low");
    assertEquals(updated.estimatedMinutes, 60);
    assertEquals(updated.actualMinutes, 45);
    assertEquals(updated.parentTaskId, "parent-456");
    assertEquals(updated.tags, ["bugfix", "review"]);
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - modifyTodo updates individual metadata fields", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Task", {
      priority: "high",
      estimatedMinutes: 100,
      database: db,
    });
    const todoDoc = await getTodoDocByName("Task", db);

    // Update only priority
    await modifyTodo(todoDoc.id, {
      priority: "medium",
      database: db,
    });

    let todo = await getTodoByName("Task", db);
    assertEquals(todo.priority, "medium");
    assertEquals(todo.estimatedMinutes, 100); // Should remain unchanged

    // Update only tags
    await modifyTodo(todoDoc.id, {
      tags: ["test", "ci"],
      database: db,
    });

    todo = await getTodoByName("Task", db);
    assertEquals(todo.priority, "medium");
    assertEquals(todo.tags, ["test", "ci"]);
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("todoApi - modifyTodo can update task and metadata together", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await addTodo("Original task", { database: db });
    const todoDoc = await getTodoDocByName("Original task", db);

    await modifyTodo(todoDoc.id, {
      task: "Updated task",
      completed: true,
      priority: "high",
      actualMinutes: 30,
      database: db,
    });

    const updated = await getTodoByName("Updated task", db);
    assertEquals(updated.task, "Updated task");
    assertEquals(updated.completed, true);
    assertEquals(updated.priority, "high");
    assertEquals(updated.actualMinutes, 30);
    assertEquals(typeof updated.completedAt, "string");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});
