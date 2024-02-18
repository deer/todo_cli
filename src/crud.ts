import { db, Todo, TodoSchema } from "./db.ts";

export async function addTodo(task: string): Promise<void> {
  const newTodo = {
    id: crypto.randomUUID(),
    task,
    completed: false,
  };
  const validatedTodo = TodoSchema.parse(newTodo);
  await db.todos.add(validatedTodo);
}

// export async function listTodos(): Promise<void> {
//   const todos = await db.todos.getMany();
//   console.table(todos.result.map((todo) => ({ ...todo.value, id: todo.id })));
// }

export async function getTodos(): Promise<Todo[]> {
  const todos = await db.todos.getMany();
  return todos.result.map((todo) => ({
    ...todo.value,
    id: todo.id.toString(),
  }));
}

export async function modifyTodo(
  id: string,
  task: string,
  completed: boolean,
): Promise<void> {
  const todoUpdate = {
    task,
    completed,
  };
  await db.todos.update(id, todoUpdate, { strategy: "merge" });
}

export async function deleteTodo(id: string): Promise<void> {
  await db.todos.delete(id);
}

export async function getTodo(id: string): Promise<Todo> {
  const todo = await db.todos.find(id);
  if (todo?.value) {
    return todo?.value;
  }
  throw new Error(`Todo with ID ${id} not found.`);
}
