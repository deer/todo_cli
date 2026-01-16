import { assertStringIncludes } from "@std/assert";
import { stripAnsiCode } from "@std/fmt/colors";
import {
  cleanupCliTestEnv,
  runTodoCli,
  setupCliTestEnv,
} from "./test_utils.ts";

Deno.test("todo CLI - shows help message when called without arguments", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    const output = await runTodoCli([], dbPath);
    const cleaned = stripAnsiCode(output);
    assertStringIncludes(cleaned, "Todo CLI");
    assertStringIncludes(cleaned, "--help");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});

Deno.test("todo CLI - shows version", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    const output = await runTodoCli(["--version"], dbPath);
    const cleaned = stripAnsiCode(output);
    // Should contain a version number
    assertStringIncludes(cleaned, "todo");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});

Deno.test("todo CLI - shows help with --help flag", async () => {
  const { tmpDir, dbPath } = await setupCliTestEnv();
  try {
    const output = await runTodoCli(["--help"], dbPath);
    const cleaned = stripAnsiCode(output);
    assertStringIncludes(cleaned, "Usage:");
    assertStringIncludes(cleaned, "add");
    assertStringIncludes(cleaned, "list");
    assertStringIncludes(cleaned, "update");
    assertStringIncludes(cleaned, "delete");
    assertStringIncludes(cleaned, "read");
  } finally {
    await cleanupCliTestEnv(tmpDir);
  }
});
