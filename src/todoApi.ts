import type { Document } from "@olli/kvdex";
import { createDb, db, type Todo, type TodoDb, TodoSchema } from "./db.ts";

/**
 * Adds a new todo to the database.
 *
 * @param task - The task description for the todo
 * @param options - Optional metadata for agent coordination
 * @returns A promise that resolves when the todo is added
 *
 * @example
 * ```ts
 * // Simple usage
 * await addTodo("Buy groceries");
 * 
 * // With metadata
 * await addTodo("Implement auth", {
 *   priority: "high",
 *   estimatedMinutes: 60,
 *   assignedTo: "agent-1",
 *   tags: ["feature", "security"]
 * });
 * ```
 */
export async function addTodo(
  task: string,
  options?: {
    assignedTo?: string;
    priority?: "high" | "medium" | "low";
    estimatedMinutes?: number;
    actualMinutes?: number;
    parentTaskId?: string;
    tags?: string[];
    database?: TodoDb;
  },
): Promise<void> {
  const targetDb = options?.database ?? db;
  
  const newTodo = {
    id: crypto.randomUUID(),
    task,
    createdAt: Temporal.Now.instant().toString(),
    completed: false,
    ...(options?.assignedTo !== undefined && { assignedTo: options.assignedTo }),
    ...(options?.priority !== undefined && { priority: options.priority }),
    ...(options?.estimatedMinutes !== undefined && { estimatedMinutes: options.estimatedMinutes }),
    ...(options?.actualMinutes !== undefined && { actualMinutes: options.actualMinutes }),
    ...(options?.parentTaskId !== undefined && { parentTaskId: options.parentTaskId }),
    ...(options?.tags !== undefined && { tags: options.tags }),
  };
  const validatedTodo = TodoSchema.parse(newTodo);
  await targetDb.todos.add(validatedTodo);
}

/**
 * Retrieves all todos from the database.
 *
 * @param database - Optional database instance. If not provided, uses the default database
 * @returns A promise that resolves to an array of todo documents
 *
 * @example
 * ```ts
 * const todos = await getTodos();
 * console.log(`You have ${todos.length} todos`);
 * ```
 */
export async function getTodos(
  database?: TodoDb,
): Promise<Document<Todo, string>[]> {
  const targetDb = database ?? db;
  const todos = await targetDb.todos.getMany();
  return todos.result;
}

/**
 * Updates an existing todo by ID.
 *
 * @param id - The unique identifier of the todo to update
 * @param updates - Updates to apply to the todo
 * @throws {Error} If the todo with the given ID is not found
 *
 * @example
 * ```ts
 * await modifyTodo("abc-123", { task: "Buy groceries", completed: true });
 * await modifyTodo("abc-123", { priority: "high", estimatedMinutes: 120 });
 * ```
 */
export async function modifyTodo(
  id: string,
  updates: {
    task?: string;
    completed?: boolean;
    assignedTo?: string;
    priority?: "high" | "medium" | "low";
    estimatedMinutes?: number;
    actualMinutes?: number;
    parentTaskId?: string;
    tags?: string[];
    database?: TodoDb;
  },
): Promise<void> {
  const targetDb = updates.database ?? db;
  
  const todoUpdate: Partial<Todo> = {
    updatedAt: Temporal.Now.instant().toString(),
  };
  
  if (updates.task !== undefined) {
    todoUpdate.task = updates.task;
  }
  
  if (updates.completed !== undefined) {
    todoUpdate.completed = updates.completed;
    if (updates.completed) {
      todoUpdate.completedAt = Temporal.Now.instant().toString();
    } else {
      todoUpdate.completedAt = undefined;
    }
  }
  
  if (updates.assignedTo !== undefined) {
    todoUpdate.assignedTo = updates.assignedTo;
  }
  
  if (updates.priority !== undefined) {
    todoUpdate.priority = updates.priority;
  }
  
  if (updates.estimatedMinutes !== undefined) {
    todoUpdate.estimatedMinutes = updates.estimatedMinutes;
  }
  
  if (updates.actualMinutes !== undefined) {
    todoUpdate.actualMinutes = updates.actualMinutes;
  }
  
  if (updates.parentTaskId !== undefined) {
    todoUpdate.parentTaskId = updates.parentTaskId;
  }
  
  if (updates.tags !== undefined) {
    todoUpdate.tags = updates.tags;
  }
  
  const result = await targetDb.todos.update(id, todoUpdate, {
    strategy: "merge",
  });
  if (!result.ok) {
    throw new Error(`Failed to update todo with ID ${id}`);
  }
}

/**
 * Deletes todos by their task names.
 *
 * @param tasks - An array of task names to delete
 * @param database - Optional database instance. If not provided, uses the default database
 *
 * @example
 * ```ts
 * await deleteTodosByName(["Buy groceries", "Walk the dog"]);
 * ```
 */
export async function deleteTodosByName(
  tasks: string[],
  database?: TodoDb,
): Promise<void> {
  const targetDb = database ?? db;
  await targetDb.todos.deleteMany({
    filter: (todo) => tasks.includes(todo.value.task),
  });
}

/**
 * Retrieves a single todo by its task name.
 *
 * @param task - The task name to search for
 * @param database - Optional database instance. If not provided, uses the default database
 * @returns A promise that resolves to the todo
 * @throws {Error} If no todo with the given task name is found
 *
 * @example
 * ```ts
 * const todo = await getTodoByName("Buy groceries");
 * console.log(todo.completed);
 * ```
 */
export async function getTodoByName(
  task: string,
  database?: TodoDb,
): Promise<Todo> {
  const targetDb = database ?? db;
  const todo = await targetDb.todos.getOne({
    filter: (todo) => todo.value.task === task,
  });
  if (todo?.value) {
    return todo?.value;
  }
  throw new Error(`Todo with task "${task}" not found.`);
}

/**
 * Marks a todo as completed by its task name.
 *
 * @param name - The task name to mark as completed
 * @param database - Optional database instance. If not provided, uses the default database
 *
 * @example
 * ```ts
 * await completeTodoByName("Buy groceries");
 * ```
 */
export async function completeTodoByName(
  name: string,
  database?: TodoDb,
): Promise<void> {
  const targetDb = database ?? db;
  const todoUpdate: Partial<Todo> = {
    completed: true,
    updatedAt: Temporal.Now.instant().toString(),
    completedAt: Temporal.Now.instant().toString(),
  };
  await targetDb.todos.updateMany(todoUpdate, {
    filter: (todo) => todo.value.task === name,
    strategy: "merge",
  });
}

/**
 * Retrieves a todo document by its task name.
 * Returns the full document including metadata.
 *
 * @param task - The task name to search for
 * @param database - Optional database instance. If not provided, uses the default database
 * @returns A promise that resolves to the todo document
 * @throws {Error} If no todo with the given task name is found
 *
 * @example
 * ```ts
 * const todoDoc = await getTodoDocByName("Buy groceries");
 * console.log(todoDoc.id, todoDoc.value);
 * ```
 */
export async function getTodoDocByName(
  task: string,
  database?: TodoDb,
): Promise<Document<Todo, string>> {
  const targetDb = database ?? db;
  const todo = await targetDb.todos.getOne({
    filter: (todo) => todo.value.task === task,
  });
  if (todo?.value) {
    return todo;
  }
  throw new Error(`Todo with task "${task}" not found.`);
}

// Re-export createDb for convenience in tests
export { createDb };
