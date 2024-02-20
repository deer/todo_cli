import { Command, Input } from "../deps.ts";
import { addTodo } from "../todoApi.ts";

export default new Command()
  .description("Add a new todo")
  .arguments("[task:string]")
  .action(addAction);

async function addAction(_options: void, task?: string) {
  if (!task) {
    task = await Input.prompt("What is your new todo?");
  }
  if (task) {
    await addTodo(task);
    console.log(`Todo added: ${task}`);
  } else {
    console.log("No todo entered. Operation cancelled.");
  }
}
