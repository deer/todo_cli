import { assertStringIncludes } from "@std/assert";
import { stripAnsiCode } from "@std/fmt/colors";
import {
  addTodoCli,
  cleanupCliTestEnv,
  runTodoCli,
  setupCliTestEnv,
} from "./test_utils.ts";

Deno.test("read command - reads existing todo", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    await addTodoCli("Test task", dbPath);

    const output = await runTodoCli(["read", "Test task"], dbPath);
    const cleaned = stripAnsiCode(output);
    assertStringIncludes(cleaned, "Test task");
    assertStringIncludes(cleaned, "task");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});

Deno.test("read command - fails for non-existent todo", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    const output = await runTodoCli(["read", "Non-existent"], dbPath);
    const cleaned = stripAnsiCode(output);
    assertStringIncludes(cleaned, "not found");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});

Deno.test("read command - shows completed status", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    await addTodoCli("Completed task", dbPath);

    const output = await runTodoCli(["read", "Completed task"], dbPath);
    const cleaned = stripAnsiCode(output);
    assertStringIncludes(cleaned, "Completed task");
    assertStringIncludes(cleaned, "completed");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});
