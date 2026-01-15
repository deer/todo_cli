# Contributing to Todo CLI

Thanks for your interest in contributing! This document provides guidelines for
contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/todo_cli.git`
3. Create a branch: `git checkout -b your-feature-name`

## Development Setup

### Prerequisites

- Deno 2.x or later

### Running Locally

```bash
# Run the CLI in development mode
deno task dev

# Run with arguments
deno task dev add "Test todo"
```

## Code Style

This project uses Deno's built-in formatting and linting tools:

```bash
# Format code
deno fmt

# Lint code
deno lint

# Type check
deno check
```

Run all checks at once:

```bash
deno task ok
```

**All code must pass `deno task ok` before submitting a PR.**

## Testing

### Writing Tests

- Tests live in the `tests/` directory
- Name test files with `_test.ts` suffix (e.g., `add_test.ts`)
- Use descriptive test names
- Test both success and error cases

### Running Tests

```bash
# Run all tests
deno task test

# Generate coverage report
deno task coverage
```

**All PRs must include tests for new functionality.**

## Adding a New Command

To add a new command to the CLI:

1. Create a new file in `src/commands/your_command.ts`
2. Export a Cliffy Command instance
3. Add the command to `todo.ts`
4. Create tests in `tests/your_command_test.ts`
5. Update README.md with usage examples

Example command structure:

```typescript
import { Command } from "@cliffy/command";

export default new Command()
  .name("yourcommand")
  .description("Description of your command")
  .action(async () => {
    // Command implementation
  });
```

## Adding API Functions

Public API functions in `src/todoApi.ts` should:

- Include JSDoc comments
- Validate input with Zod schemas
- Handle errors appropriately
- Be tested in `tests/todoApi_test.ts`

## Pull Request Process

1. **Update tests**: Ensure all tests pass
2. **Update documentation**: Update README.md if adding features
3. **Run code quality checks**: `deno task ok` must pass
4. **Write a clear PR description**: Explain what and why
5. **Keep PRs focused**: One feature/fix per PR

## Commit Messages

Use clear, descriptive commit messages:

- `feat: add search command`
- `fix: handle empty todo list in list command`
- `docs: update README with new examples`
- `test: add tests for update command`

## Code Review

- Be respectful and constructive
- Address all review comments
- Be patient - reviews may take time

## Questions?

Open an issue for questions or discussions about contributions.

## License

By contributing, you agree that your contributions will be licensed under the
MIT License.
