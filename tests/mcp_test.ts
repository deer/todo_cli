/**
 * Tests for MCP Server
 */

import { assertEquals } from "@std/assert";
import {
  handleTodoAdd,
  handleTodoComplete,
  handleTodoDelete,
  handleTodoGet,
  handleTodoList,
  handleTodoUpdate,
} from "../src/mcp/handlers.ts";
import { tools } from "../src/mcp/tools.ts";
import { cleanupApiTestEnv, setupApiTestEnv } from "./test_utils.ts";

Deno.test("MCP - tools definitions are properly structured", () => {
  assertEquals(tools.length, 6);

  // Verify each tool has required properties
  for (const tool of tools) {
    assertEquals(typeof tool.name, "string");
    assertEquals(typeof tool.description, "string");
    assertEquals(typeof tool.inputSchema, "object");
    assertEquals(tool.inputSchema.type, "object");
    assertEquals(typeof tool.inputSchema.properties, "object");
  }

  // Verify tool names
  const toolNames = tools.map((t) => t.name);
  assertEquals(toolNames.includes("todo_add"), true);
  assertEquals(toolNames.includes("todo_list"), true);
  assertEquals(toolNames.includes("todo_get"), true);
  assertEquals(toolNames.includes("todo_update"), true);
  assertEquals(toolNames.includes("todo_delete"), true);
  assertEquals(toolNames.includes("todo_complete"), true);
});

Deno.test("MCP Handler - todo_add creates a new todo", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    const result = await handleTodoAdd({ task: "Test MCP task" }, db);

    assertEquals(result.success, true);
    assertEquals(result.message, 'Todo added: "Test MCP task"');
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("MCP Handler - todo_list returns all todos", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await handleTodoAdd({ task: "Task 1" }, db);
    await handleTodoAdd({ task: "Task 2" }, db);

    const result = await handleTodoList({}, db);

    assertEquals(result.success, true);
    assertEquals(result.todos?.length, 2);
    const tasks = result.todos?.map((t) => t.task);
    assertEquals(tasks?.includes("Task 1"), true);
    assertEquals(tasks?.includes("Task 2"), true);
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("MCP Handler - todo_list filters by completed status", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await handleTodoAdd({ task: "Incomplete task" }, db);
    await handleTodoAdd({ task: "Complete task" }, db);
    await handleTodoComplete({ task: "Complete task" }, db);

    // Get only completed todos
    const completedResult = await handleTodoList({ completed: true }, db);
    assertEquals(completedResult.success, true);
    assertEquals(completedResult.todos?.length, 1);
    assertEquals(completedResult.todos?.[0].task, "Complete task");
    assertEquals(completedResult.todos?.[0].completed, true);

    // Get only incomplete todos
    const incompleteResult = await handleTodoList({ completed: false }, db);
    assertEquals(incompleteResult.success, true);
    assertEquals(incompleteResult.todos?.length, 1);
    assertEquals(incompleteResult.todos?.[0].task, "Incomplete task");
    assertEquals(incompleteResult.todos?.[0].completed, false);
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("MCP Handler - todo_get retrieves a specific todo", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await handleTodoAdd({ task: "Find me" }, db);

    const result = await handleTodoGet({ task: "Find me" }, db);

    assertEquals(result.success, true);
    assertEquals(result.todo?.task, "Find me");
    assertEquals(result.todo?.completed, false);
    assertEquals(typeof result.todo?.id, "string");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("MCP Handler - todo_get handles non-existent todo", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    const result = await handleTodoGet({ task: "Does not exist" }, db);

    assertEquals(result.success, false);
    assertEquals(typeof result.message, "string");
    assertEquals(result.message?.includes("not found"), true);
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("MCP Handler - todo_update changes task description", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await handleTodoAdd({ task: "Original task" }, db);

    const updateResult = await handleTodoUpdate({
      currentTask: "Original task",
      newTask: "Updated task",
    }, db);

    assertEquals(updateResult.success, true);

    const getResult = await handleTodoGet({ task: "Updated task" }, db);
    assertEquals(getResult.success, true);
    assertEquals(getResult.todo?.task, "Updated task");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("MCP Handler - todo_update changes completion status", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await handleTodoAdd({ task: "Task to complete" }, db);

    const updateResult = await handleTodoUpdate({
      currentTask: "Task to complete",
      completed: true,
    }, db);

    assertEquals(updateResult.success, true);

    const getResult = await handleTodoGet({ task: "Task to complete" }, db);
    assertEquals(getResult.success, true);
    assertEquals(getResult.todo?.completed, true);
    assertEquals(typeof getResult.todo?.completedAt, "string");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("MCP Handler - todo_update changes both task and completion", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await handleTodoAdd({ task: "Old task" }, db);

    const updateResult = await handleTodoUpdate({
      currentTask: "Old task",
      newTask: "New task",
      completed: true,
    }, db);

    assertEquals(updateResult.success, true);

    const getResult = await handleTodoGet({ task: "New task" }, db);
    assertEquals(getResult.success, true);
    assertEquals(getResult.todo?.task, "New task");
    assertEquals(getResult.todo?.completed, true);
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("MCP Handler - todo_delete removes single todo", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await handleTodoAdd({ task: "Delete me" }, db);
    await handleTodoAdd({ task: "Keep me" }, db);

    const deleteResult = await handleTodoDelete({ tasks: ["Delete me"] }, db);
    assertEquals(deleteResult.success, true);

    const listResult = await handleTodoList({}, db);
    assertEquals(listResult.todos?.length, 1);
    assertEquals(listResult.todos?.[0].task, "Keep me");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("MCP Handler - todo_delete removes multiple todos", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await handleTodoAdd({ task: "Delete 1" }, db);
    await handleTodoAdd({ task: "Delete 2" }, db);
    await handleTodoAdd({ task: "Keep me" }, db);

    const deleteResult = await handleTodoDelete({
      tasks: ["Delete 1", "Delete 2"],
    }, db);
    assertEquals(deleteResult.success, true);
    assertEquals(deleteResult.message, "Deletion completed for 2 task(s)");

    const listResult = await handleTodoList({}, db);
    assertEquals(listResult.todos?.length, 1);
    assertEquals(listResult.todos?.[0].task, "Keep me");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("MCP Handler - todo_complete marks todo as completed", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await handleTodoAdd({ task: "Complete this" }, db);

    const completeResult = await handleTodoComplete(
      { task: "Complete this" },
      db,
    );
    assertEquals(completeResult.success, true);

    const getResult = await handleTodoGet({ task: "Complete this" }, db);
    assertEquals(getResult.success, true);
    assertEquals(getResult.todo?.completed, true);
    assertEquals(typeof getResult.todo?.completedAt, "string");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("MCP Handler - todo_list returns empty array when no todos", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    const result = await handleTodoList({}, db);

    assertEquals(result.success, true);
    assertEquals(result.todos?.length, 0);
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("MCP Handler - todo_update handles non-existent todo", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    const result = await handleTodoUpdate({
      currentTask: "Does not exist",
      newTask: "New task",
    }, db);

    assertEquals(result.success, false);
    assertEquals(typeof result.message, "string");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});

Deno.test("MCP Handler - todo_delete handles non-existent todos gracefully", async () => {
  const { tmpDir, db, close } = await setupApiTestEnv();
  try {
    await handleTodoAdd({ task: "Existing task" }, db);

    const deleteResult = await handleTodoDelete({
      tasks: ["Non-existent task"],
    }, db);
    assertEquals(deleteResult.success, true);

    const listResult = await handleTodoList({}, db);
    assertEquals(listResult.todos?.length, 1);
    assertEquals(listResult.todos?.[0].task, "Existing task");
  } finally {
    await cleanupApiTestEnv(tmpDir, close);
  }
});
