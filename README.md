# Todo CLI

Todo CLI is a command-line utility built with Deno for managing todos. It uses
Deno KV to store todos locally.

## Features

CRUD operations for interacting with todos.

## Installation

```bash
deno install --allow-read --allow-write --allow-net=cdn.deno.land,api.github.com --allow-run https://deno.land/x/todo_cli/todo.ts
```

## Installation from Source

Ensure you have [Deno](https://deno.land/) installed on your system. To install
Todo CLI, clone the repository to your local machine:

```bash
git clone https://github.com/deer/todo_cli.git
cd todo_cli
deno install --allow-read --allow-write --allow-net=cdn.deno.land,api.github.com --allow-run todo.ts
```

## Usage
