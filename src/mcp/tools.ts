/**
 * MCP Tool Definitions for Todo CLI
 *
 * This module defines the 6 core MCP tools that expose todo operations
 * to agents and other MCP clients.
 */

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * Tool definitions for the MCP server
 */
export const tools: McpTool[] = [
  {
    name: "todo_add",
    description: "Add a new todo with a task description",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "The task description for the todo",
        },
      },
      required: ["task"],
    },
  },
  {
    name: "todo_list",
    description: "List all todos, optionally filtered by completion status",
    inputSchema: {
      type: "object",
      properties: {
        completed: {
          type: "boolean",
          description:
            "Filter by completion status. If true, show only completed todos. If false, show only incomplete todos. If omitted, show all todos.",
        },
      },
    },
  },
  {
    name: "todo_get",
    description: "Get a specific todo by task name",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "The task name to search for",
        },
      },
      required: ["task"],
    },
  },
  {
    name: "todo_update",
    description: "Update a todo's task description or completion status",
    inputSchema: {
      type: "object",
      properties: {
        currentTask: {
          type: "string",
          description: "The current task name to identify the todo",
        },
        newTask: {
          type: "string",
          description:
            "The new task description (optional if only updating completion)",
        },
        completed: {
          type: "boolean",
          description:
            "The new completion status (optional if only updating task)",
        },
      },
      required: ["currentTask"],
    },
  },
  {
    name: "todo_delete",
    description: "Delete one or more todos by task name",
    inputSchema: {
      type: "object",
      properties: {
        tasks: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Array of task names to delete",
        },
      },
      required: ["tasks"],
    },
  },
  {
    name: "todo_complete",
    description: "Mark a todo as completed by task name",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "The task name to mark as completed",
        },
      },
      required: ["task"],
    },
  },
];
