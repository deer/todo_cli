import { Command, Table } from "../deps.ts";
import { getTodos } from "../crud.ts";

export default new Command()
  .description("List all todos")
  .action(async () => {
    const todos = await getTodos();
    new Table()
      .header(["ID", "Task", "Completed"])
      .body(
        todos.map(
          (todo) => [todo.id, todo.task, todo.completed ? "Yes" : "No"],
        ),
      )
      .render();
  });
