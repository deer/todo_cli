# Copilot Instructions for Todo CLI

## Project Overview

This is a Deno-based CLI application for managing todos using Deno KV as the
storage backend. The project uses TypeScript and modern Deno features.

## Development Environment Setup

### Prerequisites

- **Deno 2.x or later** is required
- No npm or Node.js - this is a pure Deno project

### Initial Setup

1. Install Deno if not already installed:
   ```bash
   curl -fsSL https://deno.land/x/install/install.sh | sh
   ```

2. All dependencies are managed in `deno.jsonc` - no separate install step
   needed

### Running the Application

```bash
# Run in development mode (with all necessary permissions)
deno task dev

# Run with arguments
deno task dev add "Test todo"
```

### Required Deno Permissions

This project requires these Deno permissions:

- `-A` (all permissions) for development
- `--unstable-kv` for Deno KV database access
- `--unstable-temporal` for Temporal API support
- `--allow-net=cdn.deno.land,api.github.com` for network access
- `--allow-env=TODO_CLI_KV_STORE_PATH` for environment variables
- `--allow-run` for running subprocesses

## Code Quality Standards

Before submitting any changes, **ALL code must pass**:

```bash
deno task ok
```

This runs:

- `deno fmt --check` - Code formatting
- `deno lint` - Linting
- `deno check` - Type checking
- `deno task test` - All tests

### Individual Commands

```bash
# Format code
deno fmt

# Lint code
deno lint

# Type check
deno check

# Run tests
deno task test

# Generate coverage report
deno task coverage
```

## Testing Requirements

- **All new features must include tests**
- Tests are located in the `tests/` directory
- Test files use the `_test.ts` suffix
- Use descriptive test names
- Test both success and error cases
- Run tests with: `deno task test`

## Architecture Notes

### Key Technologies

- **Cliffy**: CLI framework for commands, prompts, and tables
- **Deno KV**: Built-in key-value database (no external database needed)
- **KVDEX**: Deno KV wrapper with Zod validation
- **Zod**: Schema validation

### Project Structure

- `todo.ts` - Main entry point
- `src/commands/` - Command implementations
- `src/todoApi.ts` - Public API functions
- `tests/` - Test files
- `deno.jsonc` - Configuration and dependencies

### Adding New Commands

1. Create `src/commands/your_command.ts`
2. Export a Cliffy Command instance
3. Import and add to main command in `todo.ts`
4. Create `tests/your_command_test.ts`
5. Update `README.md` with usage examples

### API Functions

Public API functions in `src/todoApi.ts` should:

- Include JSDoc comments with examples
- Validate input with Zod schemas
- Handle errors appropriately
- Be exported in the main module

## Common Gotchas

1. **No package.json**: Dependencies are in `deno.jsonc` imports map
2. **KV Store Path**: Use `Deno.env.get("TODO_CLI_KV_STORE_PATH")` for custom DB
   paths
3. **Unstable Features**: Always include `--unstable-kv` and
   `--unstable-temporal` flags
4. **File Extensions**: Always use `.ts` extensions in imports (Deno
   requirement)
5. **Import Maps**: Use the aliases defined in `deno.jsonc` (e.g.,
   `@cliffy/command`)

## Workflow for Making Changes

1. Create a feature branch
2. Make your changes
3. Run `deno task ok` to verify code quality
4. Ensure all tests pass: `deno task test`
5. Add tests for new functionality
6. Update documentation (README.md) if needed
7. Commit with descriptive messages
8. Create a pull request

## Best Practices for Copilot Agent

When working on issues:

1. **Always read the issue template carefully** - Bug reports include
   reproduction steps, feature requests include proposed solutions
2. **Check existing code first** - Look at similar commands/functions before
   implementing new ones
3. **Start with tests** - Write failing tests first, then implement the feature
   (TDD approach)
4. **Make small, focused commits** - Each commit should represent one logical
   change
5. **Update documentation** - If you add/change a command, update the README.md
6. **Follow the PR template** - Fill out all sections completely when creating
   the PR

## Common Commands Reference

```bash
# Setup and running
deno task dev                 # Run in development mode
deno task dev [args]          # Run with arguments

# Testing
deno task test                # Run all tests
deno task coverage            # Generate coverage report

# Quality checks (run before committing)
deno task ok                  # Run all checks (fmt, lint, check, test)
deno fmt                      # Format code
deno lint                     # Lint code
deno check                    # Type check

# Installation
deno task install             # Install CLI globally
```

## Additional Resources

- See `CONTRIBUTING.md` for detailed contribution guidelines
- See `README.md` for user-facing documentation
- Check existing commands in `src/commands/` for examples
- Use issue templates in `.github/ISSUE_TEMPLATE/` for bug reports and feature
  requests
