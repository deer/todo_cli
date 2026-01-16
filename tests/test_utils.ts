/**
 * Shared test utilities for todo CLI tests
 */

import { retry } from "@std/async";
import $ from "@david/dax";
import { createDb } from "../src/todoApi.ts";
import type { TodoDb } from "../src/db.ts";

/**
 * CLI Test Environment Setup
 */
export interface CliTestEnv {
  tmpDir: string;
  dbPath: string;
}

export async function setupCliTestEnv(): Promise<CliTestEnv> {
  const tmpDir = await Deno.makeTempDir();
  const dbPath = `${tmpDir}/kv.db`;
  return { tmpDir, dbPath };
}

export async function cleanupCliTestEnv(tmpDir: string): Promise<void> {
  await retry(() => Deno.remove(tmpDir, { recursive: true }));
}

/**
 * API Test Environment Setup
 */
export interface ApiTestEnv {
  tmpDir: string;
  db: TodoDb;
  close: () => void;
}

export async function setupApiTestEnv(): Promise<ApiTestEnv> {
  const tmpDir = await Deno.makeTempDir();
  const { db, close } = await createDb(`${tmpDir}/kv.db`);
  return { tmpDir, db, close };
}

export async function cleanupApiTestEnv(
  tmpDir: string,
  close: () => void,
): Promise<void> {
  close();
  await retry(() => Deno.remove(tmpDir, { recursive: true }));
}

/**
 * CLI Helper Functions
 */

/**
 * Add a todo using the CLI
 * @param task The task description
 * @param dbPath The database path
 */
export async function addTodoCli(task: string, dbPath: string): Promise<void> {
  await $`deno run -A --unstable-kv --unstable-temporal todo.ts add ${task}`
    .env("TODO_CLI_KV_STORE_PATH", dbPath)
    .captureCombined();
  // Wait for KV database to flush and close
  await new Promise((resolve) => setTimeout(resolve, 500));
}

/**
 * Run a todo CLI command
 * @param args Command arguments (e.g., ["list"], ["add", "task"])
 * @param dbPath The database path
 * @param options Additional options
 * @returns The command output
 */
export async function runTodoCli(
  args: string[],
  dbPath: string,
  options?: {
    stdinText?: string;
    noThrow?: boolean;
  },
): Promise<string> {
  // Build command by spreading args
  let cmd;
  switch (args.length) {
    case 0:
      cmd = $`deno run -A --unstable-kv --unstable-temporal todo.ts`;
      break;
    case 1:
      cmd = $`deno run -A --unstable-kv --unstable-temporal todo.ts ${args[0]}`;
      break;
    case 2:
      cmd = $`deno run -A --unstable-kv --unstable-temporal todo.ts ${
        args[0]
      } ${args[1]}`;
      break;
    case 3:
      cmd = $`deno run -A --unstable-kv --unstable-temporal todo.ts ${
        args[0]
      } ${args[1]} ${args[2]}`;
      break;
    case 4:
      cmd = $`deno run -A --unstable-kv --unstable-temporal todo.ts ${
        args[0]
      } ${args[1]} ${args[2]} ${args[3]}`;
      break;
    default:
      // For more args, concatenate them
      cmd = $`deno run -A --unstable-kv --unstable-temporal todo.ts ${
        args.join(" ")
      }`;
  }

  cmd = cmd.env("TODO_CLI_KV_STORE_PATH", dbPath)
    .captureCombined();

  if (options?.stdinText) {
    cmd = cmd.stdinText(options.stdinText);
  }

  // Default to noThrow = true unless explicitly set to false
  if (options?.noThrow !== false) {
    cmd = cmd.noThrow();
  }

  return await cmd.text();
}
