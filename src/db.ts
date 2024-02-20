import { collection, kvdex, z, zodModel } from "./deps.ts";

export const TodoSchema = z.object({
  id: z.string(),
  task: z.string(),
  completed: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  completedAt: z.string().optional(),
});

export type Todo = z.infer<typeof TodoSchema>;

const kvStorePath = Deno.env.get("TODO_CLI_KV_STORE_PATH");
const kv = await Deno.openKv(kvStorePath);

export const db = kvdex(kv, {
  todos: collection(zodModel(TodoSchema)),
});
