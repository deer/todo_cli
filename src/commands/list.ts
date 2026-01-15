import { Command } from "@cliffy/command";
import { Table } from "@cliffy/table";
import { getTodos } from "../todoApi.ts";

export default new Command()
  .description("List all todos")
  .option("-l, --long", "Display full information including dates")
  .action(listAction);

async function listAction({ long }: { long?: true | undefined }) {
  const todos = await getTodos();
  const headers = ["Task", "Completed"];
  if (long) {
    headers.push("Created At", "Updated At", "Completed At");
  }
  const table = new Table().header(headers);
  const body = todos.map((todoDoc) => {
    const todo = todoDoc.value;
    const row = [todo.task, todo.completed ? "Yes" : "No"];
    if (long) {
      row.push(
        todo.createdAt ? formatTemporalOrIsoString(todo.createdAt) : "N/A",
        todo.updatedAt ? formatTemporalOrIsoString(todo.updatedAt) : "N/A",
        todo.completedAt ? formatTemporalOrIsoString(todo.completedAt) : "N/A",
        todo.id,
        todoDoc.id.toString(),
      );
    }
    return row;
  });
  table.body(body).maxColWidth(40).border().render();
}

function formatTemporalOrIsoString(isoString: string): string {
  try {
    const instant = Temporal.Instant.from(isoString);
    return instant.toLocaleString("en-US");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}
