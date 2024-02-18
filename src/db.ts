import { collection, kvdex, z, zodModel } from "./deps.ts";

export const TodoSchema = z.object({
  id: z.string(),
  task: z.string(),
  completed: z.boolean(),
});

export type Todo = z.infer<typeof TodoSchema>;

const kv = await Deno.openKv();

export const db = kvdex(kv, {
  todos: collection(zodModel(TodoSchema)),
});
