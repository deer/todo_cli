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
  // console.log(todos);
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
  // console.log({ todoUpdate });
  const result = await db.todos.update(id, todoUpdate, { strategy: "merge" });
  if (!result.ok) {
    throw new Error(`Failed to update todo with ID ${id}`);
  }
  // const updatedTodo = await db.todos.find(id);
  // console.log({ updatedTodo });
}

export async function modifyTodoByName(
  task: string,
  newTask: string,
  completed: boolean,
): Promise<void> {
  const todoUpdate: Partial<Todo> = {
    task: newTask,
    completed,
    updatedAt: Temporal.Now.instant().toString(),
  };
  if (completed) {
    todoUpdate.completedAt = Temporal.Now.instant().toString();
  } else {
    todoUpdate.completedAt = undefined;
  }
  console.log({ task });
  console.log({ todoUpdate });
  const result = await db.todos.updateMany(todoUpdate, {
    filter: (todo) => todo.value.task === task,
    strategy: "merge",
  });
  // if (!result.ok) {
  //   throw new Error(`Failed to update todo with Name ${task}`);
  // }
}

export async function deleteTodo(id: string): Promise<void> {
  await db.todos.delete(id);
}

export async function deleteTodoByName(task: string): Promise<void> {
  await db.todos.deleteMany({
    filter: (todo) => todo.value.task === task,
  });
  // await db.todos.deleteByPrimaryIndex("task", task);
}

export async function deleteTodosByName(tasks: string[]) {
  await db.todos.deleteMany({
    filter: (todo) => tasks.includes(todo.value.task),
  });
  // for (const task of tasks) {
  //   await deleteTodoByName(task);
  // }
}

export async function getTodo(id: string): Promise<Todo> {
  const todo = await db.todos.find(id);
  console.log({ todo });
  if (todo?.value) {
    return todo?.value;
  }
  throw new Error(`Todo with ID ${id} not found.`);
}

export async function getTodoByName(task: string): Promise<Todo> {
  // console.log("hello");
  // console.log({ task });
  // const todo = await db.todos.findByPrimaryIndex("task", task);
  const todo = await db.todos.getOne({
    filter: (todo) => todo.value.task === task,
  });
  console.log({ todo });
  if (todo?.value) {
    return todo?.value;
  }
  throw new Error(`Todo with task "${task}" not found.`);
}

export async function completeTodo(id: string) {
  await db.todos.update(id, {
    completed: true,
    completedAt: Temporal.Now.instant().toString(),
    updatedAt: Temporal.Now.instant().toString(),
  }, { strategy: "merge" });
}

export async function completeTodoByName(name: string) {
  const todoUpdate: Partial<Todo> = {
    completed: true,
    updatedAt: Temporal.Now.instant().toString(),
    completedAt: Temporal.Now.instant().toString(),
  };
  console.log({ name });
  console.log({ todoUpdate });
  const result = await db.todos.updateMany(todoUpdate, {
    filter: (todo) => todo.value.task === name,
    strategy: "merge",
  });
  // const result = await db.todos.updateByPrimaryIndex("task", name, todoUpdate, {
  //   strategy: "merge",
  // });
  // if (!result.ok) {
  //   throw new Error(`Failed to update todo with Name ${name}`);
  // }
}

export async function getTodoDocByName(task: string) {
  // const todo = await db.todos.findByPrimaryIndex("task", task);
  const todo = await db.todos.getOne({
    filter: (todo) => todo.value.task === task,
  });
  if (todo?.value) {
    return todo;
  }
  throw new Error(`Todo with task "${task}" not found.`);
}
