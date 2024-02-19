import { Command } from "../deps.ts";
import { getTodoByName } from "../todoApi.ts";

export default new Command()
  .description("Read a single todo")
  .arguments("<name:string>")
  .action(readAction);

export async function readAction(_: void, name: string) {
  const todo = await getTodoByName(name);
  console.table(todo);
}
