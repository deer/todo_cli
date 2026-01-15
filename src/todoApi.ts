import type { Document } from "@olli/kvdex";
import { db, Todo, TodoSchema } from "./db.ts";

/**
 * Adds a new todo to the database.
 *
 * @param task - The task description for the todo
 * @returns A promise that resolves when the todo is added
 *
 * @example
 * ```ts
 * await addTodo("Buy groceries");
 * ```
 */
export async function addTodo(task: string): Promise<void> {
  const newTodo = {
    id: crypto.randomUUID(),
    task,
    createdAt: Temporal.Now.instant().toString(),
    completed: false,
  };
  const validatedTodo = TodoSchema.parse(newTodo);
  await db.todos.add(validatedTodo);
}

/**
 * Retrieves all todos from the database.
 *
 * @returns A promise that resolves to an array of todo documents
 *
 * @example
 * ```ts
 * const todos = await getTodos();
 * console.log(`You have ${todos.length} todos`);
 * ```
 */
export async function getTodos(): Promise<Document<Todo, string>[]> {
  const todos = await db.todos.getMany();
  return todos.result;
}

/**
 * Updates an existing todo by ID.
 *
 * @param id - The unique identifier of the todo to update
 * @param task - The new task description
 * @param completed - Whether the todo is completed
 * @throws {Error} If the todo with the given ID is not found
 *
 * @example
 * ```ts
 * await modifyTodo("abc-123", "Buy groceries and cook dinner", true);
 * ```
 */
export async function modifyTodo(
  id: string,
  task: string,
  completed: boolean,
): Promise<void> {
  const todoUpdate: Partial<Todo> = {
    task,
    completed,
    updatedAt: Temporal.Now.instant().toString(),
  };
  if (completed) {
    todoUpdate.completedAt = Temporal.Now.instant().toString();
  } else {
    todoUpdate.completedAt = undefined;
  }
  const result = await db.todos.update(id, todoUpdate, { strategy: "merge" });
  if (!result.ok) {
    throw new Error(`Failed to update todo with ID ${id}`);
  }
}

/**
 * Deletes todos by their task names.
 *
 * @param tasks - An array of task names to delete
 *
 * @example
 * ```ts
 * await deleteTodosByName(["Buy groceries", "Walk the dog"]);
 * ```
 */
export async function deleteTodosByName(tasks: string[]) {
  await db.todos.deleteMany({
    filter: (todo) => tasks.includes(todo.value.task),
  });
}

/**
 * Retrieves a single todo by its task name.
 *
 * @param task - The task name to search for
 * @returns A promise that resolves to the todo
 * @throws {Error} If no todo with the given task name is found
 *
 * @example
 * ```ts
 * const todo = await getTodoByName("Buy groceries");
 * console.log(todo.completed);
 * ```
 */
export async function getTodoByName(task: string): Promise<Todo> {
  const todo = await db.todos.getOne({
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
 *
 * @example
 * ```ts
 * await completeTodoByName("Buy groceries");
 * ```
 */
export async function completeTodoByName(name: string) {
  const todoUpdate: Partial<Todo> = {
    completed: true,
    updatedAt: Temporal.Now.instant().toString(),
    completedAt: Temporal.Now.instant().toString(),
  };
  await db.todos.updateMany(todoUpdate, {
    filter: (todo) => todo.value.task === name,
    strategy: "merge",
  });
}

/**
 * Retrieves a todo document by its task name.
 * Returns the full document including metadata.
 *
 * @param task - The task name to search for
 * @returns A promise that resolves to the todo document
 * @throws {Error} If no todo with the given task name is found
 *
 * @example
 * ```ts
 * const todoDoc = await getTodoDocByName("Buy groceries");
 * console.log(todoDoc.id, todoDoc.value);
 * ```
 */
export async function getTodoDocByName(task: string) {
  const todo = await db.todos.getOne({
    filter: (todo) => todo.value.task === task,
  });
  if (todo?.value) {
    return todo;
  }
  throw new Error(`Todo with task "${task}" not found.`);
}
