import { Command, Input, Select, Toggle } from "../deps.ts";
import { getTodos, modifyTodo } from "../crud.ts";

export default new Command()
  .description("Update an existing todo")
  .arguments("[id:string] [task:string] [completed:boolean]")
  .option("-m, --manual", "Manually update a todo by providing all arguments")
  .action(async ({ manual }, id, task, completed) => {
    if (manual && id && task !== undefined && completed !== undefined) {
      modifyTodo(id, task, completed === true);
    } else {
      const todos = await getTodos();
      if (todos.length === 0) {
        console.log("No todos to update.");
        return;
      }
      const todoChoices = todos.map((todo) => `${todo.task} (ID: ${todo.id})`);
      const selectedTodo = await Select.prompt({
        message: "Select a todo to update",
        options: todoChoices,
      });
      const match = selectedTodo.match(/\(ID: (.*)\)/);
      if (!match || match.length < 2) {
        console.log("Failed to extract the todo ID.");
        return;
      }
      const selectedId = match[1];

      const selectedTodoItem = todos.find((todo) => todo.id === selectedId);

      if (!selectedTodoItem) {
        console.log("Selected todo not found.");
        return;
      }

      const newTask = await Input.prompt({
        message: "Enter the new task description",
        default: selectedTodoItem.task,
      });
      const newCompleted = await Toggle.prompt({
        message: "Is the task completed?",
        default: selectedTodoItem.completed,
        inactive: "no",
        active: "yes",
      });

      modifyTodo(selectedId, newTask, newCompleted === true);
    }
  });
