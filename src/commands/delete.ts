import { Checkbox, Command } from "../deps.ts";
import { deleteTodoByName, deleteTodosByName, getTodos } from "../todoApi.ts";

export default new Command()
  .description("Delete a todo")
  .option(
    "-m, --manual [name:string]",
    "Manually delete a todo by providing its name",
  )
  .action(async ({ manual }, name?: string) => {
    if (manual && name) {
      await deleteTodoByName(name);
      console.log(`Todo ${name} deleted.`);
    } else {
      const todos = await getTodos();
      if (todos.length === 0) {
        console.log("No todos to delete.");
        return;
      }
      const todoChoices = todos.map((todo) => `${todo.value.task}`);
      const selectedTodos = await Checkbox.prompt({
        message: "Select a todo to delete",
        options: todoChoices,
      });
      if (selectedTodos.length === 0) {
        console.log("No todos selected.");
        return;
      }
      await deleteTodosByName(selectedTodos);
    }
  });
