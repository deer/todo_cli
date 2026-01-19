#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --unstable-kv --unstable-temporal
/**
 * MCP Server for Todo CLI
 * 
 * This is the main entry point for the MCP (Model Context Protocol) server.
 * It exposes todo operations as MCP tools that can be called by agents and
 * other MCP clients like Claude Desktop.
 * 
 * The server implements the MCP protocol over stdio using JSON-RPC 2.0.
 */

import { tools } from "./tools.ts";
import {
  handleTodoAdd,
  handleTodoComplete,
  handleTodoDelete,
  handleTodoGet,
  handleTodoList,
  handleTodoUpdate,
} from "./handlers.ts";

/**
 * JSON-RPC 2.0 Request
 */
interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: unknown;
}

/**
 * JSON-RPC 2.0 Response
 */
interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * MCP Server Class
 */
class McpServer {
  private serverInfo = {
    name: "todo-cli-mcp-server",
    version: "1.0.0",
  };

  /**
   * Process a single JSON-RPC request
   */
  async processRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const { id, method, params } = request;

    try {
      // Handle MCP protocol methods
      switch (method) {
        case "initialize":
          return this.handleInitialize(id);

        case "tools/list":
          return this.handleToolsList(id);

        case "tools/call":
          return await this.handleToolsCall(id, params);

        case "ping":
          return {
            jsonrpc: "2.0",
            id: id ?? null,
            result: {},
          };

        default:
          return {
            jsonrpc: "2.0",
            id: id ?? null,
            error: {
              code: -32601,
              message: `Method not found: ${method}`,
            },
          };
      }
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id: id ?? null,
        error: {
          code: -32603,
          message: `Internal error: ${(error as Error).message}`,
        },
      };
    }
  }

  /**
   * Handle initialize request
   */
  private handleInitialize(
    id: string | number | null | undefined,
  ): JsonRpcResponse {
    return {
      jsonrpc: "2.0",
      id: id ?? null,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {},
        },
        serverInfo: this.serverInfo,
      },
    };
  }

  /**
   * Handle tools/list request
   */
  private handleToolsList(
    id: string | number | null | undefined,
  ): JsonRpcResponse {
    return {
      jsonrpc: "2.0",
      id: id ?? null,
      result: {
        tools,
      },
    };
  }

  /**
   * Handle tools/call request
   */
  private async handleToolsCall(
    id: string | number | null | undefined,
    params: unknown,
  ): Promise<JsonRpcResponse> {
    if (!params || typeof params !== "object") {
      return {
        jsonrpc: "2.0",
        id: id ?? null,
        error: {
          code: -32602,
          message: "Invalid params: must be an object",
        },
      };
    }

    const { name, arguments: args } = params as {
      name: string;
      arguments?: Record<string, unknown>;
    };

    if (!name) {
      return {
        jsonrpc: "2.0",
        id: id ?? null,
        error: {
          code: -32602,
          message: "Invalid params: 'name' is required",
        },
      };
    }

    // Route to appropriate handler
    let result;
    try {
      switch (name) {
        case "todo_add":
          result = await handleTodoAdd(args as { task: string });
          break;

        case "todo_list":
          result = await handleTodoList(args as { completed?: boolean });
          break;

        case "todo_get":
          result = await handleTodoGet(args as { task: string });
          break;

        case "todo_update":
          result = await handleTodoUpdate(
            args as { currentTask: string; newTask?: string; completed?: boolean },
          );
          break;

        case "todo_delete":
          result = await handleTodoDelete(args as { tasks: string[] });
          break;

        case "todo_complete":
          result = await handleTodoComplete(args as { task: string });
          break;

        default:
          return {
            jsonrpc: "2.0",
            id: id ?? null,
            error: {
              code: -32602,
              message: `Unknown tool: ${name}`,
            },
          };
      }

      return {
        jsonrpc: "2.0",
        id: id ?? null,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        },
      };
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id: id ?? null,
        error: {
          code: -32603,
          message: `Tool execution failed: ${(error as Error).message}`,
        },
      };
    }
  }

  /**
   * Start the server and listen for requests on stdin
   */
  async start(): Promise<void> {
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    // Write to stderr for logging (stdout is reserved for JSON-RPC)
    const log = (message: string) => {
      const logMessage = `[MCP Server] ${message}\n`;
      Deno.stderr.writeSync(encoder.encode(logMessage));
    };

    log(`Starting ${this.serverInfo.name} v${this.serverInfo.version}`);
    log("Listening for JSON-RPC requests on stdin...");

    // Read from stdin line by line
    const buffer: Uint8Array[] = [];
    const reader = Deno.stdin.readable.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer.push(value);

        // Try to parse complete JSON-RPC messages
        const text = decoder.decode(
          new Uint8Array(buffer.flatMap((b) => Array.from(b))),
        );
        const lines = text.split("\n");

        // Keep the last incomplete line in the buffer
        const lastLine = lines.pop() || "";
        buffer.length = 0;
        if (lastLine) {
          buffer.push(encoder.encode(lastLine));
        }

        // Process complete lines
        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const request = JSON.parse(line) as JsonRpcRequest;
            log(`Received request: ${request.method}`);

            const response = await this.processRequest(request);

            // Write response to stdout
            const responseText = JSON.stringify(response) + "\n";
            await Deno.stdout.write(encoder.encode(responseText));
          } catch (error) {
            log(`Error processing request: ${(error as Error).message}`);
            // Send error response for invalid JSON
            const errorResponse: JsonRpcResponse = {
              jsonrpc: "2.0",
              id: null,
              error: {
                code: -32700,
                message: "Parse error",
              },
            };
            await Deno.stdout.write(
              encoder.encode(JSON.stringify(errorResponse) + "\n"),
            );
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    log("Server stopped");
  }
}

// Start the server if this is the main module
if (import.meta.main) {
  const server = new McpServer();
  await server.start();
}

export { McpServer };
