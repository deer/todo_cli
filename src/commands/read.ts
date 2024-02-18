import { Command } from "../deps.ts";
import { getTodo } from "../crud.ts";

export default new Command()
  .description("Read a single todo")
  .arguments("<id:string>")
  .action((_, id: string) => {
    const todo = getTodo(id);
    console.table(todo);
  });
