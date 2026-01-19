import { Command } from "@cliffy/command";
import { Checkbox, Input, Select, Toggle } from "@cliffy/prompt";
import {
  completeTodoByName,
  getTodoDocByName,
  getTodos,
  modifyTodo,
} from "../todoApi.ts";

export default new Command()
  .description("Update an existing todo")
  .arguments("[task:string] [completed:boolean]")
  .option("-b, --bulk-complete", "Bulk complete todos")
  .action(updateAction);

async function updateAction(
  { bulkComplete }: {
    bulkComplete?: true | undefined;
  },
) {
  if (bulkComplete) {
    const todos = await getTodos();
    if (todos.length === 0) {
      console.log("No todos available.");
      return;
    }
    const todoChoices = todos.map((todo) => `${todo.value.task}`);
    const selectedTodos = await Checkbox.prompt({
      message: "Select todos to mark as completed",
      options: todoChoices,
    });
    for (const selectedTodo of selectedTodos) {
      await completeTodoByName(selectedTodo);
    }
  } else {
    const todos = await getTodos();
    if (todos.length === 0) {
      console.log("No todos to update.");
      return;
    }
    const todoChoices = todos.map((todo) => `${todo.value.task}`);
    const selectedTodoName = await Select.prompt({
      message: "Select a todo to update",
      options: todoChoices,
    });

    if (!selectedTodoName) {
      console.log("Selected todo not found.");
      return;
    }

    const selectedTodoItem = await getTodoDocByName(selectedTodoName);

    const newTask = await Input.prompt({
      message: "Enter the new task description",
      default: selectedTodoItem.value.task,
    });
    const newCompleted = await Toggle.prompt({
      message: "Is the task completed?",
      default: selectedTodoItem.value.completed,
      inactive: "no",
      active: "yes",
    });

    await modifyTodo(selectedTodoItem.id, newTask, newCompleted === true);
  }
}
