import { Command } from "@cliffy/command";
import { Input } from "@cliffy/prompt";
import { addTodo } from "../todoApi.ts";

export default new Command()
  .description("Add a new todo")
  .arguments("[task:string]")
  .option("--assigned-to <assignee:string>", "Assign todo to an agent or person")
  .option("--priority <priority:string>", "Priority level: high, medium, or low")
  .option("--estimated <minutes:number>", "Estimated time to complete in minutes")
  .option("--actual <minutes:number>", "Actual time spent in minutes")
  .option("--parent <taskId:string>", "Parent task ID for hierarchical breakdown")
  .option("--tags <tags:string>", "Comma-separated tags for categorization")
  .action(addAction);

async function addAction(
  options: {
    assignedTo?: string;
    priority?: string;
    estimated?: number;
    actual?: number;
    parent?: string;
    tags?: string;
  },
  task?: string,
) {
  if (!task) {
    task = await Input.prompt("What is your new todo?");
  }
  if (task) {
    // Validate priority if provided
    if (options.priority && !["high", "medium", "low"].includes(options.priority)) {
      console.log("Error: Priority must be one of: high, medium, low");
      return;
    }

    // Parse tags from comma-separated string
    const tags = options.tags ? options.tags.split(",").map(t => t.trim()) : undefined;

    await addTodo(task, {
      assignedTo: options.assignedTo,
      priority: options.priority as "high" | "medium" | "low" | undefined,
      estimatedMinutes: options.estimated,
      actualMinutes: options.actual,
      parentTaskId: options.parent,
      tags,
    });
    console.log(`Todo added: ${task}`);
  } else {
    console.log("No todo entered. Operation cancelled.");
  }
}
