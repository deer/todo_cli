import { Command } from "@cliffy/command";
import { Table } from "@cliffy/table";
import { getTodos } from "../todoApi.ts";

export default new Command()
  .description("List all todos")
  .option("-l, --long", "Display full information including dates and metadata")
  .option(
    "--priority <priority:string>",
    "Filter by priority: high, medium, or low",
  )
  .option("--assigned-to <assignee:string>", "Filter by assignee")
  .option("--tag <tag:string>", "Filter by tag")
  .action(listAction);

async function listAction(options: {
  long?: true | undefined;
  priority?: string;
  assignedTo?: string;
  tag?: string;
}) {
  let todos = await getTodos();

  // Apply filters
  if (options.priority) {
    todos = todos.filter((todo) => todo.value.priority === options.priority);
  }
  if (options.assignedTo) {
    todos = todos.filter((todo) =>
      todo.value.assignedTo === options.assignedTo
    );
  }
  if (options.tag) {
    todos = todos.filter((todo) =>
      todo.value.tags?.includes(options.tag || "")
    );
  }

  const headers = ["Task", "Completed"];
  if (options.long) {
    headers.push(
      "Priority",
      "Assigned",
      "Est(min)",
      "Act(min)",
      "Tags",
      "Created At",
    );
  }
  const table = new Table().header(headers);
  const body = todos.map((todoDoc) => {
    const todo = todoDoc.value;
    const row: string[] = [todo.task, todo.completed ? "Yes" : "No"];
    if (options.long) {
      row.push(
        todo.priority ?? "N/A",
        todo.assignedTo ?? "N/A",
        todo.estimatedMinutes?.toString() ?? "N/A",
        todo.actualMinutes?.toString() ?? "N/A",
        todo.tags?.join(", ") ?? "N/A",
        todo.createdAt ? formatTemporalOrIsoString(todo.createdAt) : "N/A",
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
