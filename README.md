# Todo CLI

A simple, fast command-line todo manager built with Deno. Uses Deno KV for local
storage.

## Features

- ✅ Create, read, update, and delete todos
- 📦 Local storage with Deno KV (no external database required)
- 🎨 Interactive prompts for easy todo management
- ⚡ Fast and lightweight
- 🔄 Built-in upgrade command
- 🤖 MCP (Model Context Protocol) server for agent integration

## Prerequisites

[Deno](https://deno.land/) 2.x or later

## Installation

### From Source

```bash
git clone https://github.com/deer/todo_cli.git
cd todo_cli
deno task install
```

Or manually:

```bash
deno install -g --allow-net=cdn.deno.land,api.github.com --allow-env=TODO_CLI_KV_STORE_PATH --allow-run --unstable-kv --unstable-temporal --config deno.jsonc todo.ts -f
```

## Usage

### Add a Todo

```bash
# Interactive prompt
todo add

# Direct command
todo add "Buy groceries"
```

### List Todos

```bash
# List all todos
todo list
```

### Read a Todo

```bash
todo read "Buy groceries"
```

### Update a Todo

```bash
# Interactive update
todo update "Buy groceries"

# Mark as complete/incomplete via update
todo update "Buy groceries" --completed
```

### Delete a Todo

```bash
todo delete "Buy groceries"

# Delete multiple
todo delete "Task 1" "Task 2"
```

### Upgrade

```bash
todo upgrade
```

## MCP Server Integration

The Todo CLI includes an MCP (Model Context Protocol) server that enables agents and AI assistants to manage todos programmatically. This makes it perfect for integration with Claude Desktop, agent frameworks, and other MCP clients.

### Starting the MCP Server

```bash
deno task mcp
```

The server listens for JSON-RPC 2.0 requests on stdin and responds on stdout, following the MCP specification.

### Available MCP Tools

The MCP server exposes 6 tools for todo management:

#### 1. `todo_add`
Add a new todo with a task description.

**Parameters:**
- `task` (string, required): The task description

**Example:**
```json
{
  "name": "todo_add",
  "arguments": {
    "task": "Buy groceries"
  }
}
```

#### 2. `todo_list`
List all todos, optionally filtered by completion status.

**Parameters:**
- `completed` (boolean, optional): Filter by completion status
  - `true`: Show only completed todos
  - `false`: Show only incomplete todos
  - Omit: Show all todos

**Example:**
```json
{
  "name": "todo_list",
  "arguments": {
    "completed": false
  }
}
```

#### 3. `todo_get`
Get a specific todo by task name.

**Parameters:**
- `task` (string, required): The task name to search for

**Example:**
```json
{
  "name": "todo_get",
  "arguments": {
    "task": "Buy groceries"
  }
}
```

#### 4. `todo_update`
Update a todo's task description or completion status.

**Parameters:**
- `currentTask` (string, required): The current task name to identify the todo
- `newTask` (string, optional): The new task description
- `completed` (boolean, optional): The new completion status

**Example:**
```json
{
  "name": "todo_update",
  "arguments": {
    "currentTask": "Buy groceries",
    "newTask": "Buy groceries and cook dinner",
    "completed": true
  }
}
```

#### 5. `todo_delete`
Delete one or more todos by task name.

**Parameters:**
- `tasks` (array of strings, required): Array of task names to delete

**Example:**
```json
{
  "name": "todo_delete",
  "arguments": {
    "tasks": ["Buy groceries", "Walk the dog"]
  }
}
```

#### 6. `todo_complete`
Mark a todo as completed by task name.

**Parameters:**
- `task` (string, required): The task name to mark as completed

**Example:**
```json
{
  "name": "todo_complete",
  "arguments": {
    "task": "Buy groceries"
  }
}
```

### Using with Claude Desktop

To integrate with Claude Desktop, add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "todo-cli": {
      "command": "deno",
      "args": [
        "task",
        "mcp"
      ],
      "cwd": "/path/to/todo_cli"
    }
  }
}
```

After configuration, Claude Desktop will be able to manage your todos using natural language commands.

### MCP Protocol Details

The server implements the Model Context Protocol over stdio using JSON-RPC 2.0:
- **Protocol Version**: 2024-11-05
- **Capabilities**: Tools
- **Transport**: stdio (standard input/output)

All requests and responses follow the JSON-RPC 2.0 specification with proper error handling.

## Development

### Setup

1. Clone the repository
2. Ensure Deno 2.x is installed

### Running Locally

```bash
deno task dev
```

### Running Tests

```bash
# Run all tests
deno task test

# Generate coverage report
deno task coverage
```

### Code Quality

```bash
# Run all checks (format, lint, type-check, test)
deno task ok
```

## Storage

Todos are stored locally using Deno KV. By default, the KV store is created in
the OS-specific data directory. You can customize the storage location using the
`TODO_CLI_KV_STORE_PATH` environment variable:

```bash
export TODO_CLI_KV_STORE_PATH="/path/to/your/todos.db"
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT
