# Schema Validation Library

A comprehensive NestJS validation library that leverages Zod for strong TypeScript integration and improved developer experience. This library replaces traditional class-validator and class-transformer setups with a more modern, type-safe approach.

## Features

- 🔒 **Type-Safe Validation**: Full TypeScript integration with Zod schemas
- 🎯 **Multiple Validation Contexts**: HTTP requests, CQRS commands/queries, and events
- 🛠️ **Decorator-Based**: Clean, declarative validation using decorators
- 📋 **Reusable Schemas**: Common validation patterns out of the box
- 🚨 **Enhanced Error Handling**: Detailed validation error messages
- ⚡ **Performance Optimized**: Efficient validation with minimal overhead
- 🔧 **Factory Function**: Use `schemaValidationPipe()` for cleaner syntax without `new` keyword

## Installation & Setup

### 1. Import SchemaValidationModule

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { SchemaValidationModule } from '@schema-validation';

@Module({
  imports: [
    SchemaValidationModule, // Automatically registers global interceptor
    // ... other modules
  ],
})
export class AppModule {}
```

### 2. Available Decorators

#### HTTP Request Validation (Decorator-based via interceptors)

- `@ValidateBodySchema(schema)` - Validates request body
- `@ValidateQueryParamSchema(schema)` - Validates query parameters  
- `@ValidateParamSchema(schema)` - Validates route parameters

#### CQRS Validation (Class-based decorators via interceptors)

- `@ValidateCommandSchema(schema)` - Validates CQRS commands
- `@ValidateQuerySchema(schema)` - Validates CQRS queries

#### Event Validation (Decorator-based via interceptors)

- `@ValidateEventPayloadSchema(schema)` - Validates event payloads

#### Direct Pipe Usage

- `schemaValidationPipe()` - Factory function for creating validation pipes

## Usage Examples

> **💡 Tip**: For parameter-level validation, use the `schemaValidationPipe()` factory function for cleaner syntax. For method-level validation, use decorators.

### Method 1: Using Validation Decorators (Recommended)

```typescript
// ...existing code...
```

### Method 2: Using schemaValidationPipe Factory

The library provides a factory function for cleaner pipe usage without the `new` keyword:

```typescript
import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { z } from 'zod';
import { schemaValidationPipe } from '@schema-validation';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  age: z.number().int().min(18).max(120)
});

const UserParamSchema = z.object({
  id: z.string().uuid()
});

@Controller('users')
export class UsersController {
  @Post()
  async createUser(
    @Body(schemaValidationPipe(CreateUserSchema)) userData: z.infer<typeof CreateUserSchema>
  ) {
    return this.usersService.create(userData);
  }

  @Get(':id')
  async getUser(
    @Param('id', schemaValidationPipe(UserParamSchema.shape.id)) id: string
  ) {
    return this.usersService.findOne(id);
  }

  // With custom validation type and options
  @Post('advanced')
  async createUserAdvanced(
    @Body(schemaValidationPipe(
      CreateUserSchema, 
      'request body',
      { 
        errorMessage: 'Invalid user data provided',
        transform: true 
      }
    )) userData: z.infer<typeof CreateUserSchema>
  ) {
    return this.usersService.create(userData);
  }
}
```

### Method 3: Advanced Usage with schemaValidationPipe

You can use the `schemaValidationPipe` factory function with custom options for advanced scenarios:

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { z } from 'zod';
import { schemaValidationPipe } from '@schema-validation';

const MySchema = z.object({
  // ...fields...
});

@Controller('users')
export class UsersController {
  @Post('advanced')
  async advancedEndpoint(
    @Body(schemaValidationPipe(
      MySchema,
      'custom validation', // validation type for error messages
      {
        transform: true,      // Return transformed data from Zod
        stripUnknown: true,   // Remove unknown fields (not implemented yet)
        errorMessage: 'Custom error message'
      }
    )) data: any
  ) {
    return data;
  }
}
```

## Advanced Usage

### Custom Validation Options

The `schemaValidationPipe()` factory function accepts options for advanced use cases:

```typescript
import { schemaValidationPipe } from '@schema-validation';

@Controller('users')
export class UsersController {
  @Post('advanced')
  async advancedEndpoint(
    @Body(schemaValidationPipe(
      MySchema,
      'custom validation', // validation type for error messages
      {
        transform: true,      // Return transformed data from Zod
        stripUnknown: true,   // Remove unknown fields (not implemented yet)
        errorMessage: 'Custom error message'
      }
    )) data: MyType
  ) {
    return data;
  }
}
```
