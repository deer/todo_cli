/**
 * MCP Tool Handlers for Todo CLI
 *
 * This module implements the execution handlers for each MCP tool,
 * wrapping the existing todoApi.ts functions without duplicating business logic.
 */

import {
  addTodo,
  completeTodoByName,
  deleteTodosByName,
  getTodoByName,
  getTodoDocByName,
  getTodos,
  modifyTodo,
} from "../todoApi.ts";
import type { TodoDb } from "../db.ts";

/**
 * Handler for todo_add tool
 */
export async function handleTodoAdd(
  args: {
    task: string;
    assignedTo?: string;
    priority?: "high" | "medium" | "low";
    estimatedMinutes?: number;
    actualMinutes?: number;
    parentTaskId?: string;
    tags?: string[];
  },
  db?: TodoDb,
): Promise<{ success: boolean; message: string }> {
  try {
    await addTodo(args.task, {
      assignedTo: args.assignedTo,
      priority: args.priority,
      estimatedMinutes: args.estimatedMinutes,
      actualMinutes: args.actualMinutes,
      parentTaskId: args.parentTaskId,
      tags: args.tags,
      database: db,
    });
    return {
      success: true,
      message: `Todo added: "${args.task}"`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to add todo: ${(error as Error).message}`,
    };
  }
}

/**
 * Handler for todo_list tool
 */
export async function handleTodoList(
  args: { completed?: boolean },
  db?: TodoDb,
): Promise<{
  success: boolean;
  todos?: Array<{
    id: string;
    task: string;
    completed: boolean;
    createdAt?: string;
    updatedAt?: string;
    completedAt?: string;
    assignedTo?: string;
    priority?: "high" | "medium" | "low";
    estimatedMinutes?: number;
    actualMinutes?: number;
    parentTaskId?: string;
    tags?: string[];
  }>;
  message?: string;
}> {
  try {
    const allTodos = await getTodos(db);
    let filteredTodos = allTodos;

    // Apply completion filter if specified
    if (args.completed !== undefined) {
      filteredTodos = allTodos.filter(
        (todo) => todo.value.completed === args.completed,
      );
    }

    const todos = filteredTodos.map((todo) => ({
      id: todo.value.id,
      task: todo.value.task,
      completed: todo.value.completed,
      createdAt: todo.value.createdAt,
      updatedAt: todo.value.updatedAt,
      completedAt: todo.value.completedAt,
      assignedTo: todo.value.assignedTo,
      priority: todo.value.priority,
      estimatedMinutes: todo.value.estimatedMinutes,
      actualMinutes: todo.value.actualMinutes,
      parentTaskId: todo.value.parentTaskId,
      tags: todo.value.tags,
    }));

    return {
      success: true,
      todos,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to list todos: ${(error as Error).message}`,
    };
  }
}

/**
 * Handler for todo_get tool
 */
export async function handleTodoGet(
  args: { task: string },
  db?: TodoDb,
): Promise<{
  success: boolean;
  todo?: {
    id: string;
    task: string;
    completed: boolean;
    createdAt?: string;
    updatedAt?: string;
    completedAt?: string;
    assignedTo?: string;
    priority?: "high" | "medium" | "low";
    estimatedMinutes?: number;
    actualMinutes?: number;
    parentTaskId?: string;
    tags?: string[];
  };
  message?: string;
}> {
  try {
    const todo = await getTodoByName(args.task, db);
    return {
      success: true,
      todo: {
        id: todo.id,
        task: todo.task,
        completed: todo.completed,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt,
        completedAt: todo.completedAt,
        assignedTo: todo.assignedTo,
        priority: todo.priority,
        estimatedMinutes: todo.estimatedMinutes,
        actualMinutes: todo.actualMinutes,
        parentTaskId: todo.parentTaskId,
        tags: todo.tags,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to get todo: ${(error as Error).message}`,
    };
  }
}

/**
 * Handler for todo_update tool
 */
export async function handleTodoUpdate(
  args: {
    currentTask: string;
    newTask?: string;
    completed?: boolean;
    assignedTo?: string;
    priority?: "high" | "medium" | "low";
    estimatedMinutes?: number;
    actualMinutes?: number;
    parentTaskId?: string;
    tags?: string[];
  },
  db?: TodoDb,
): Promise<{ success: boolean; message: string }> {
  try {
    // Get the current todo to retrieve its ID and current values
    const todoDoc = await getTodoDocByName(args.currentTask, db);

    await modifyTodo(todoDoc.id, {
      task: args.newTask,
      completed: args.completed,
      assignedTo: args.assignedTo,
      priority: args.priority,
      estimatedMinutes: args.estimatedMinutes,
      actualMinutes: args.actualMinutes,
      parentTaskId: args.parentTaskId,
      tags: args.tags,
      database: db,
    });

    return {
      success: true,
      message: `Todo updated: "${args.currentTask}"`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update todo: ${(error as Error).message}`,
    };
  }
}

/**
 * Handler for todo_delete tool
 */
export async function handleTodoDelete(
  args: { tasks: string[] },
  db?: TodoDb,
): Promise<{ success: boolean; message: string }> {
  try {
    await deleteTodosByName(args.tasks, db);
    const taskList = args.tasks.length === 1
      ? `"${args.tasks[0]}"`
      : `${args.tasks.length} task(s)`;
    return {
      success: true,
      message: `Todo(s) deleted: ${taskList}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete todos: ${(error as Error).message}`,
    };
  }
}

/**
 * Handler for todo_complete tool
 */
export async function handleTodoComplete(
  args: { task: string },
  db?: TodoDb,
): Promise<{ success: boolean; message: string }> {
  try {
    await completeTodoByName(args.task, db);
    return {
      success: true,
      message: `Todo marked as completed: "${args.task}"`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to complete todo: ${(error as Error).message}`,
    };
  }
}
