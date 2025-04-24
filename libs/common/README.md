# Common Library Guidelines

This library (`libs/common`) is shared across different parts of the system, including both standard NestJS applications and the `agent-orchestrator` which runs Temporal workflows.

## ❗ Do Not Import NestJS Logic Here

Avoid importing or referencing any NestJS-specific logic, such as:
- `@nestjs/common`
- Decorators like `@Injectable`, `@Module`, etc.
- Pipes, Guards, or Interceptors
- Class-validator or class-transformer

## 🧠 Why This Matters

Temporal workflows run in a **sandboxed V8 environment**. To ensure deterministic behavior, Temporal uses Webpack to statically bundle workflow code. This imposes strict constraints:
- No access to Node.js standard libraries
- No dynamic module resolution
- No NestJS or other non-deterministic logic

If any file within this shared `common` library imports or depends on NestJS (even transitively), **it will break Temporal’s bundling process** and your workflow worker will fail at runtime.

## ✅ Safe to Include

- Plain TypeScript types
- Enums
- Constants
- DTOs (without decorators)
- Signal and workflow name definitions

Use this folder as a clean, framework-agnostic source of shared logic.