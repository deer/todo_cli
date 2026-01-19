import { assertStringIncludes } from "@std/assert";
import { stripAnsiCode } from "@std/fmt/colors";
import {
  cleanupCliTestEnv,
  runTodoCli,
  setupCliTestEnv,
} from "./test_utils.ts";

Deno.test("update command - bulk complete shows message when no todos", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    const output = await runTodoCli(
      ["update", "--bulk-complete"],
      dbPath,
      { stdinText: "\n" },
    );
    const cleaned = stripAnsiCode(output);
    assertStringIncludes(cleaned, "No todos available");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});

Deno.test("update command - shows message when no todos to update", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    const output = await runTodoCli(
      ["update"],
      dbPath,
      { stdinText: "\n" },
    );
    const cleaned = stripAnsiCode(output);
    assertStringIncludes(cleaned, "No todos to update");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});
