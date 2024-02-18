import { Command, Select } from "../deps.ts";
import { deleteTodo, getTodos } from "../crud.ts";

export default new Command()
  .description("Delete a todo")
  .option(
    "-m, --manual [id:string]",
    "Manually delete a todo by providing its ID",
  )
  .action(async ({ manual }, id?: string) => {
    if (manual && id) {
      await deleteTodo(id);
      console.log(`Todo ${id} deleted.`);
    } else {
      const todos = await getTodos();
      if (todos.length === 0) {
        console.log("No todos to delete.");
        return;
      }
      const todoChoices = todos.map((todo) => `${todo.task} (ID: ${todo.id})`);
      const selectedTodo = await Select.prompt({
        message: "Select a todo to delete",
        options: todoChoices,
      });
      const match = selectedTodo.match(/\(ID: (.*)\)/);
      if (!match || match.length < 2) {
        console.log("Failed to extract the todo ID.");
        return;
      }
      const selectedId = match[1];
      await deleteTodo(selectedId);
      console.log(`Todo ${selectedId} deleted.`);
    }
  });
