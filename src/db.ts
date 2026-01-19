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
 * @property assignedTo - Optional assignee identifier for agent coordination
 * @property priority - Optional priority level: high, medium, or low
 * @property estimatedMinutes - Optional estimated time to complete in minutes
 * @property actualMinutes - Optional actual time spent in minutes
 * @property parentTaskId - Optional parent task ID for hierarchical task breakdown
 * @property tags - Optional array of tags for categorization
 */
export const TodoSchema = z.object({
  id: z.string(),
  task: z.string(),
  completed: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  completedAt: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  estimatedMinutes: z.number().optional(),
  actualMinutes: z.number().optional(),
  parentTaskId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Type definition for a Todo item.
 */
export type Todo = z.infer<typeof TodoSchema>;

/**
 * Database schema definition
 */
const dbSchema = {
  todos: collection(TodoSchema),
};

/**
 * Type definition for the database instance
 */
export type TodoDb = ReturnType<typeof createDbInstance>;

function createDbInstance(kv: Deno.Kv) {
  return kvdex({
    kv,
    schema: dbSchema,
  });
}

let cachedDb: TodoDb | null = null;

/**
 * Creates a new database instance with the given KV store path.
 *
 * @param kvStorePath - Optional path to the KV store. If not provided, uses TODO_CLI_KV_STORE_PATH env variable
 * @returns An object with the database instance and a close method
 */
export async function createDb(kvStorePath?: string): Promise<{
  db: TodoDb;
  kv: Deno.Kv;
  close: () => void;
}> {
  const path = kvStorePath ?? Deno.env.get("TODO_CLI_KV_STORE_PATH");
  const kv = await Deno.openKv(path);
  const db = createDbInstance(kv);
  return {
    db,
    kv,
    close: () => kv.close(),
  };
}

/**
 * Gets the shared database instance, creating it if necessary.
 * Uses the TODO_CLI_KV_STORE_PATH environment variable for the path.
 *
 * @returns The shared database instance
 */
export async function getDb(): Promise<TodoDb> {
  if (!cachedDb) {
    const { db } = await createDb();
    cachedDb = db;
  }
  return cachedDb;
}

/**
 * Default database instance using kvdex for type-safe KV operations.
 * Contains a single collection: `todos`
 *
 * @deprecated Use getDb() instead for better testability
 */
export const db = await getDb();
