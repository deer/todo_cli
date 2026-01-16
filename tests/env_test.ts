import { assertEquals } from "@std/assert";
import { stripAnsiCode } from "@std/fmt/colors";
import {
  cleanupCliTestEnv,
  runTodoCli,
  setupCliTestEnv,
} from "./test_utils.ts";

Deno.test("environment variable - TODO_CLI_KV_STORE_PATH is respected", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();

  try {
    // Set the environment variable and add a todo
    const output = await runTodoCli(["add", "Env test todo"], dbPath);

    assertEquals(stripAnsiCode(output), "Todo added: Env test todo");

    // Verify the database file was created at the custom location
    const fileInfo = await Deno.stat(dbPath);
    assertEquals(fileInfo.isFile, true);
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});
