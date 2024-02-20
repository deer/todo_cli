import { db, Todo, TodoSchema } from "./db.ts";
import { Document, KvId } from "./deps.ts";

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

export async function getTodos(): Promise<Document<Todo>[]> {
  const todos = await db.todos.getMany();
  return todos.result;
}

export async function modifyTodo(
  id: KvId,
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

export async function deleteTodosByName(tasks: string[]) {
  await db.todos.deleteMany({
    filter: (todo) => tasks.includes(todo.value.task),
  });
}

export async function getTodoByName(task: string): Promise<Todo> {
  const todo = await db.todos.getOne({
    filter: (todo) => todo.value.task === task,
  });
  if (todo?.value) {
    return todo?.value;
  }
  throw new Error(`Todo with task "${task}" not found.`);
}

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

export async function getTodoDocByName(task: string) {
  const todo = await db.todos.getOne({
    filter: (todo) => todo.value.task === task,
  });
  if (todo?.value) {
    return todo;
  }
  throw new Error(`Todo with task "${task}" not found.`);
}
