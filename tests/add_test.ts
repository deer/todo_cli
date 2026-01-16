import { assertEquals, assertStringIncludes } from "@std/assert";
import { stripAnsiCode } from "@std/fmt/colors";
import {
  cleanupCliTestEnv,
  runTodoCli,
  setupCliTestEnv,
} from "./test_utils.ts";

Deno.test("add command - basic add with argument", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    const output = await runTodoCli(["add", "test todo"], dbPath);
    assertEquals(stripAnsiCode(output), "Todo added: test todo");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});

Deno.test("add command - add with prompt", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    const output = await runTodoCli(["add"], dbPath, {
      stdinText: "test todo\n",
    });
    assertStringIncludes(stripAnsiCode(output), "What is your new todo?");
    assertStringIncludes(stripAnsiCode(output), "Todo added: test todo");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});

Deno.test("add command - multiple todos can be added", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    const output1 = await runTodoCli(["add", "First todo"], dbPath);
    assertEquals(stripAnsiCode(output1), "Todo added: First todo");

    const output2 = await runTodoCli(["add", "Second todo"], dbPath);
    assertEquals(stripAnsiCode(output2), "Todo added: Second todo");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});

Deno.test("add command - empty input cancels operation", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    const output = await runTodoCli(["add"], dbPath, { stdinText: "\n" });
    assertStringIncludes(
      stripAnsiCode(output),
      "No todo entered. Operation cancelled.",
    );
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});
