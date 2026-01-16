import { assertEquals, assertThrows } from "@std/assert";
import { TodoSchema } from "../src/db.ts";

Deno.test("db schema - validates valid todo object", () => {
  const validTodo = {
    id: "test-id",
    task: "Test task",
    completed: false,
    createdAt: "2026-01-15T12:00:00Z",
    updatedAt: "2026-01-15T12:00:00Z",
    completedAt: "2026-01-15T12:00:00Z",
  };

  const result = TodoSchema.parse(validTodo);
  assertEquals(result.id, "test-id");
  assertEquals(result.task, "Test task");
  assertEquals(result.completed, false);
});

Deno.test("db schema - validates minimal todo object", () => {
  const minimalTodo = {
    id: "test-id",
    task: "Test task",
    completed: false,
  };

  const result = TodoSchema.parse(minimalTodo);
  assertEquals(result.id, "test-id");
  assertEquals(result.task, "Test task");
  assertEquals(result.completed, false);
});

Deno.test("db schema - rejects todo without id", () => {
  const invalidTodo = {
    task: "Test task",
    completed: false,
  };

  assertThrows(
    () => TodoSchema.parse(invalidTodo),
    Error,
  );
});

Deno.test("db schema - rejects todo without task", () => {
  const invalidTodo = {
    id: "test-id",
    completed: false,
  };

  assertThrows(
    () => TodoSchema.parse(invalidTodo),
    Error,
  );
});

Deno.test("db schema - rejects todo without completed field", () => {
  const invalidTodo = {
    id: "test-id",
    task: "Test task",
  };

  assertThrows(
    () => TodoSchema.parse(invalidTodo),
    Error,
  );
});

Deno.test("db schema - rejects todo with wrong type for id", () => {
  const invalidTodo = {
    id: 123,
    task: "Test task",
    completed: false,
  };

  assertThrows(
    () => TodoSchema.parse(invalidTodo),
    Error,
  );
});

Deno.test("db schema - rejects todo with wrong type for task", () => {
  const invalidTodo = {
    id: "test-id",
    task: 123,
    completed: false,
  };

  assertThrows(
    () => TodoSchema.parse(invalidTodo),
    Error,
  );
});

Deno.test("db schema - rejects todo with wrong type for completed", () => {
  const invalidTodo = {
    id: "test-id",
    task: "Test task",
    completed: "yes",
  };

  assertThrows(
    () => TodoSchema.parse(invalidTodo),
    Error,
  );
});

Deno.test("db schema - accepts optional timestamp fields", () => {
  const todoWithOptionalFields = {
    id: "test-id",
    task: "Test task",
    completed: true,
    createdAt: "2026-01-15T12:00:00Z",
  };

  const result = TodoSchema.parse(todoWithOptionalFields);
  assertEquals(result.createdAt, "2026-01-15T12:00:00Z");
  assertEquals(result.updatedAt, undefined);
  assertEquals(result.completedAt, undefined);
});

Deno.test("db schema - rejects invalid timestamp type", () => {
  const invalidTodo = {
    id: "test-id",
    task: "Test task",
    completed: false,
    createdAt: 123456789,
  };

  assertThrows(
    () => TodoSchema.parse(invalidTodo),
    Error,
  );
});
