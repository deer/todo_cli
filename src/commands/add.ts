import { Command } from "../deps.ts";
import { addTodo } from "../crud.ts";

export default new Command()
  .description("Add a new todo")
  .arguments("<task:string>")
  .action((_options, task) => {
    addTodo(task);
  });
