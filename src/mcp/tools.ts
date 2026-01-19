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
    description: "Add a new todo with a task description and optional metadata for agent coordination",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "The task description for the todo",
        },
        assignedTo: {
          type: "string",
          description: "Assignee identifier for agent coordination",
        },
        priority: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Priority level: high, medium, or low",
        },
        estimatedMinutes: {
          type: "number",
          description: "Estimated time to complete in minutes",
        },
        actualMinutes: {
          type: "number",
          description: "Actual time spent in minutes",
        },
        parentTaskId: {
          type: "string",
          description: "Parent task ID for hierarchical task breakdown",
        },
        tags: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Array of tags for categorization",
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
    description: "Update a todo's task description, completion status, or metadata",
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
            "The new task description (optional)",
        },
        completed: {
          type: "boolean",
          description:
            "The new completion status (optional)",
        },
        assignedTo: {
          type: "string",
          description: "Assignee identifier (optional)",
        },
        priority: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Priority level: high, medium, or low (optional)",
        },
        estimatedMinutes: {
          type: "number",
          description: "Estimated time to complete in minutes (optional)",
        },
        actualMinutes: {
          type: "number",
          description: "Actual time spent in minutes (optional)",
        },
        parentTaskId: {
          type: "string",
          description: "Parent task ID (optional)",
        },
        tags: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Array of tags (optional)",
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
