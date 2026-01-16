import { assertStringIncludes } from "@std/assert";
import { stripAnsiCode } from "@std/fmt/colors";
import {
  addTodoCli,
  cleanupCliTestEnv,
  runTodoCli,
  setupCliTestEnv,
} from "./test_utils.ts";

Deno.test("delete command - manual delete with name", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    await addTodoCli("Task to delete", dbPath);

    const output = await runTodoCli(
      ["delete", "--manual", "Task to delete"],
      dbPath,
    );
    const cleaned = stripAnsiCode(output);
    assertStringIncludes(cleaned, "deleted");

    // Verify it's gone
    const listOutput = await runTodoCli(["list"], dbPath);
    const listCleaned = stripAnsiCode(listOutput);
    // Should not contain the deleted task
    if (listCleaned.includes("Task to delete")) {
      throw new Error("Task was not deleted");
    }
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});

Deno.test("delete command - handles empty todo list", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    const output = await runTodoCli(["delete"], dbPath, { stdinText: "\n" });
    const cleaned = stripAnsiCode(output);
    assertStringIncludes(cleaned, "No todos to delete");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});

Deno.test("delete command - can delete multiple todos", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    await addTodoCli("First task", dbPath);
    await addTodoCli("Second task", dbPath);

    await runTodoCli(["delete", "--manual", "First task"], dbPath);

    const listOutput = await runTodoCli(["list"], dbPath);
    const listCleaned = stripAnsiCode(listOutput);

    if (listCleaned.includes("First task")) {
      throw new Error("First task was not deleted");
    }
    assertStringIncludes(listCleaned, "Second task");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});
