import { assertStringIncludes } from "@std/assert";
import { stripAnsiCode } from "@std/fmt/colors";
import {
  addTodoCli,
  cleanupCliTestEnv,
  runTodoCli,
  setupCliTestEnv,
} from "./test_utils.ts";

Deno.test("list command - shows empty list", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    const output = await runTodoCli(["list"], dbPath);
    const cleaned = stripAnsiCode(output);
    // Should show table headers at minimum
    assertStringIncludes(cleaned, "Task");
    assertStringIncludes(cleaned, "Completed");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});

Deno.test("list command - shows single todo", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    await addTodoCli("Buy groceries", dbPath);

    const output = await runTodoCli(["list"], dbPath);
    const cleaned = stripAnsiCode(output);
    assertStringIncludes(cleaned, "Buy groceries");
    assertStringIncludes(cleaned, "No");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});

Deno.test("list command - shows multiple todos", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    await addTodoCli("Buy groceries", dbPath);
    await addTodoCli("Walk the dog", dbPath);
    await addTodoCli("Write code", dbPath);

    const output = await runTodoCli(["list"], dbPath);
    const cleaned = stripAnsiCode(output);
    assertStringIncludes(cleaned, "Buy groceries");
    assertStringIncludes(cleaned, "Walk the dog");
    assertStringIncludes(cleaned, "Write code");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});

Deno.test("list command - long format includes dates", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    await addTodoCli("Test todo", dbPath);

    const output = await runTodoCli(["list", "--long"], dbPath);
    const cleaned = stripAnsiCode(output);
    assertStringIncludes(cleaned, "Test todo");
    assertStringIncludes(cleaned, "Created At");
    assertStringIncludes(cleaned, "Priority");
    assertStringIncludes(cleaned, "Assigned");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});

Deno.test("list command - long format shows N/A for missing dates", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    await addTodoCli("Incomplete task", dbPath);

    const output = await runTodoCli(["list", "--long"], dbPath);
    const cleaned = stripAnsiCode(output);
    assertStringIncludes(cleaned, "Incomplete task");
    assertStringIncludes(cleaned, "No");
    // Should have N/A for completed at
    assertStringIncludes(cleaned, "N/A");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});
