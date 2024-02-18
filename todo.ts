import addCommand from "./src/commands/add.ts";
import deleteCommand from "./src/commands/delete.ts";
import listCommand from "./src/commands/list.ts";
import readCommand from "./src/commands/read.ts";
import updateCommand from "./src/commands/update.ts";
import {
  Command,
  CompletionsCommand,
  DenoLandProvider,
  GithubProvider,
  UpgradeCommand,
} from "./src/deps.ts";
import { getLatestVersion } from "./src/version.ts";

await new Command()
  .name("todo")
  .version(getLatestVersion())
  .description(
    "A CLI utility for managing todos. No more switching context in order to remember something!",
  )
  .action(() => {
    console.log("Todo CLI. Use --help for more information on commands.");
  })
  .command("completions", new CompletionsCommand())
  .command(
    "upgrade",
    new UpgradeCommand({
      main: "./todo.ts",
      args: [
        "--allow-net=cdn.deno.land,api.github.com",
        "--allow-run",
        "--unstable-kv",
      ],
      provider: [
        new DenoLandProvider({ name: "todo_cli" }),
        new GithubProvider({ repository: "deer/todo_cli" }),
      ],
    }),
  )
  .command("add", addCommand)
  .command("list", listCommand)
  .command("update", updateCommand)
  .command("delete", deleteCommand)
  .command("read", readCommand)
  .parse(Deno.args);
