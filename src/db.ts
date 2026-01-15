import { collection, kvdex } from "@olli/kvdex";
import { z } from "zod";

/**
 * Zod schema for validating Todo objects.
 *
 * @property id - Unique identifier for the todo
 * @property task - The task description
 * @property completed - Whether the task is completed
 * @property createdAt - ISO 8601 timestamp when the todo was created
 * @property updatedAt - ISO 8601 timestamp when the todo was last updated
 * @property completedAt - ISO 8601 timestamp when the todo was marked complete
 */
export const TodoSchema = z.object({
  id: z.string(),
  task: z.string(),
  completed: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  completedAt: z.string().optional(),
});

/**
 * Type definition for a Todo item.
 */
export type Todo = z.infer<typeof TodoSchema>;

const kvStorePath = Deno.env.get("TODO_CLI_KV_STORE_PATH");
const kv = await Deno.openKv(kvStorePath);

/**
 * Database instance using kvdex for type-safe KV operations.
 * Contains a single collection: `todos`
 */
export const db = kvdex({
  kv,
  schema: {
    todos: collection(TodoSchema),
  },
});
