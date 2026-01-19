# Todo CLI

A simple, fast command-line todo manager built with Deno. Uses Deno KV for local
storage.

## Features

- ✅ Create, read, update, and delete todos
- 📦 Local storage with Deno KV (no external database required)
- 🎨 Interactive prompts for easy todo management
- ⚡ Fast and lightweight
- 🔄 Built-in upgrade command

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
