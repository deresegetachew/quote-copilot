# Schema Validation Library

A comprehensive NestJS validation library that leverages Zod for strong TypeScript integration and improved developer experience. This library replaces traditional class-validator and class-transformer setups with a more modern, type-safe approach.

## Features

- 🔒 **Type-Safe Validation**: Full TypeScript integration with Zod schemas
- 🎯 **Multiple Validation Contexts**: HTTP requests, CQRS commands/queries, and events
- 🛠️ **Decorator-Based**: Clean, declarative validation using decorators
- 📋 **Reusable Schemas**: Common validation patterns out of the box
- 🚨 **Enhanced Error Handling**: Detailed validation error messages
- ⚡ **Performance Optimized**: Efficient validation with minimal overhead

## Installation & Setup

### 1. Import ValidationModule

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ValidationModule } from '@schema-validation';

@Module({
  imports: [
    ValidationModule.forRoot(), // Register global interceptor
    // ... other modules
  ],
})
export class AppModule {}
```

### 2. Available Decorators

#### HTTP Request Validation (Immediate validation via pipes)

- `@ValidateBodySchema(schema)` - Validates request body
- `@ValidateQueryParamSchema(schema)` - Validates query parameters
- `@ValidateParamSchema(schema)` - Validates route parameters

#### CQRS Validation (Metadata-driven via interceptors)

- `@ValidateCommandSchema(schema)` - Validates CQRS commands
- `@ValidateQuerySchema(schema)` - Validates CQRS queries
- `@ValidateEventPayloadSchema(schema)` - Validates event payloads

## Usage Examples

### HTTP Controllers

```typescript
import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { z } from 'zod';
import { 
  ValidateBodySchema, 
  ValidateQueryParamSchema, 
  ValidateParamSchema 
} from '@schema-validation';

// Define schemas
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  age: z.number().int().min(18).max(120)
});

const UserQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional()
});

const UserParamSchema = z.object({
  id: z.string().uuid()
});

@Controller('users')
export class UsersController {
  @Post()
  @ValidateBodySchema(CreateUserSchema)
  async createUser(@Body() createUserDto: z.infer<typeof CreateUserSchema>) {
    // createUserDto is fully typed and validated
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ValidateQueryParamSchema(UserQuerySchema)
  async getUsers(@Query() query: z.infer<typeof UserQuerySchema>) {
    // query is fully typed with defaults applied
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ValidateParamSchema(UserParamSchema)
  async getUser(@Param() params: z.infer<typeof UserParamSchema>) {
    // params.id is guaranteed to be a valid UUID
    return this.usersService.findOne(params.id);
  }
}
```

## Validation Approaches

This library supports two validation approaches:

### 1. Pipe-Based Validation (Direct)

This approach uses NestJS pipes directly within decorators like `@UsePipes()`. The validation happens immediately when the decorator is applied.

```typescript
import { applyDecorators, UsePipes } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '@schema-validation';

// Direct pipe usage - validates immediately
export function ValidateBodySchema<T>(schema: z.ZodSchema<T>) {
  return applyDecorators(
    UsePipes(new ZodValidationPipe(schema, 'request body'))
  );
}
```

### 2. Metadata-Based Validation (Interceptor)

This approach stores validation schemas as metadata and processes them through interceptors. This provides more flexibility and separation of concerns.

```typescript
import 'reflect-metadata';
import { z } from 'zod';

// Metadata-based approach - processed by interceptor
export function ValidateBodySchema<T>(schema: z.ZodSchema<T>) {
  return function (target: any, propertyKey: string | symbol | undefined, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('validation:schema', schema, target, propertyKey);
    Reflect.defineMetadata('validation:type', 'request body', target, propertyKey);
    return descriptor;
  };
}
```

To use the metadata-based approach, register the global interceptor:

```typescript
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ZodValidationInterceptor } from '@schema-validation';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodValidationInterceptor,
    },
  ],
})
export class AppModule {}
```

**Benefits of Metadata-Based Approach:**

- Better separation of concerns
- More flexible validation logic
- Easier to extend with custom validation rules
- Can be processed by multiple interceptors
- Better testability

### When to Use Each Approach

**Use ZodValidationPipe directly when:**

- You need fine-grained control over validation timing
- You want to validate specific parameters individually
- You're migrating from class-validator gradually
- You need custom validation logic per endpoint
- You want explicit, visible validation in your controller methods

**Use Interceptor-based validation (decorators) when:**

- You want clean, declarative code
- You're building new applications from scratch
- You need consistent validation patterns across your app
- You want automatic validation for CQRS commands/queries/events
- You prefer convention over configuration

### CQRS Commands and Queries

```typescript
import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { z } from 'zod';
import { ValidateCommandSchema, ValidateQuerySchema } from '@schema-validation';

// Command Schema
const CreateRfqCommandSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  budget: z.number().positive(),
  deadline: z.date().min(new Date()),
  tenantId: z.string().uuid()
});

export class CreateRfqCommand {
  constructor(public readonly data: z.infer<typeof CreateRfqCommandSchema>) {}
}

@CommandHandler(CreateRfqCommand)
@ValidateCommandSchema(CreateRfqCommandSchema)
export class CreateRfqCommandHandler implements ICommandHandler<CreateRfqCommand> {
  async execute(command: CreateRfqCommand) {
    // command.data is fully validated and typed
    return this.rfqService.create(command.data);
  }
}

// Query Schema
const GetRfqsQuerySchema = z.object({
  tenantId: z.string().uuid(),
  status: z.enum(['draft', 'published', 'closed']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10)
});

export class GetRfqsQuery {
  constructor(public readonly filters: z.infer<typeof GetRfqsQuerySchema>) {}
}

@QueryHandler(GetRfqsQuery)
@ValidateQuerySchema(GetRfqsQuerySchema)
export class GetRfqsQueryHandler implements IQueryHandler<GetRfqsQuery> {
  async execute(query: GetRfqsQuery) {
    // query.filters is fully validated and typed
    return this.rfqService.findAll(query.filters);
  }
}
```

### Event Validation

```typescript
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { z } from 'zod';
import { ValidateEventPayloadSchema } from '@schema-validation';

const RfqCreatedEventSchema = z.object({
  rfqId: z.string().uuid(),
  tenantId: z.string().uuid(),
  title: z.string(),
  createdBy: z.string().uuid(),
  createdAt: z.date()
});

export class RfqCreatedEvent {
  constructor(public readonly payload: z.infer<typeof RfqCreatedEventSchema>) {}
}

@EventsHandler(RfqCreatedEvent)
@ValidateEventPayloadSchema(RfqCreatedEventSchema)
export class RfqCreatedEventHandler implements IEventHandler<RfqCreatedEvent> {
  async handle(event: RfqCreatedEvent) {
    // event.payload is fully validated and typed
    await this.notificationService.sendRfqCreatedNotification(event.payload);
  }
}
```

## Reusable Schemas

The library provides common validation schemas for typical use cases:

```typescript
import { 
  EmailSchema, 
  UuidSchema, 
  PaginationSchema, 
  MongoIdSchema,
  RfqSchema,
  ContactInfoSchema 
} from '@schema-validation';

// Use built-in schemas
const UserSchema = z.object({
  email: EmailSchema,
  id: UuidSchema,
  profile: ContactInfoSchema
});

const GetUsersSchema = z.object({
  ...PaginationSchema.shape, // Includes page, limit, etc.
  status: z.enum(['active', 'inactive']).optional()
});
```

### Available Reusable Schemas

- `EmailSchema` - Email validation
- `UuidSchema` - UUID v4 validation
- `MongoIdSchema` - MongoDB ObjectId validation
- `PaginationSchema` - Standard pagination (page, limit, offset)
- `ContactInfoSchema` - Contact information (name, email, phone)
- `RfqSchema` - RFQ data structure
- `RfqItemSchema` - RFQ item structure
- `AddressSchema` - Address structure

## Utility Functions

```typescript
import { validateSchema, createValidationError } from '@schema-validation';

// Manual validation
const result = validateSchema(MySchema, data);
if (!result.success) {
  throw createValidationError(result.error, 'Custom context');
}

// Use validated data
const validData = result.data;
```

## Error Handling

The library provides detailed error messages:

```json
{
  "message": "Validation failed",
  "statusCode": 400,
  "context": "Body validation",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    },
    {
      "field": "age",
      "message": "Number must be greater than or equal to 18",
      "value": 15
    }
  ]
}
```

## Advanced Usage

### Using ZodValidationPipe Directly

The library exposes `ZodValidationPipe` that you can use directly with `@UsePipes()` decorator or inject into your controllers:

```typescript
import { Controller, Post, Body, UsePipes, Inject } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '@schema-validation';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  age: z.number().int().min(18).max(120)
});

@Controller('users')
export class UsersController {
  // Method 1: Direct pipe usage with @UsePipes
  @Post('direct')
  @UsePipes(new ZodValidationPipe(CreateUserSchema, 'Create User'))
  async createUserDirect(@Body() userData: z.infer<typeof CreateUserSchema>) {
    return this.usersService.create(userData);
  }

  // Method 2: Inject pipe as dependency
  constructor(
    private readonly usersService: UsersService,
    @Inject(ZodValidationPipe) private readonly validationPipe: ZodValidationPipe,
  ) {}

  @Post('injected')
  async createUserWithInjectedPipe(@Body() userData: any) {
    // Manually validate using injected pipe
    const validatedData = this.validationPipe.transform(userData, { type: 'body' });
    return this.usersService.create(validatedData);
  }
}
```

### Custom Validation Pipe

```typescript
// Create custom validation pipe for specific needs
@Injectable()
export class CustomValidationPipe extends ZodValidationPipe {
  constructor() {
    super(
      z.object({ /* your schema */ }),
      'Custom validation',
      { 
        transform: true, // Enable data transformation
        stripUnknown: true // Remove unknown fields
      }
    );
  }
}

@Controller('custom')
export class CustomController {
  @Post()
  @UsePipes(CustomValidationPipe)
  async customEndpoint(@Body() data: any) {
    return data;
  }
}
```

### Schema Composition

```typescript
// Compose complex schemas from simpler ones
const BaseUserSchema = z.object({
  email: EmailSchema,
  name: z.string().min(2)
});

const CreateUserSchema = BaseUserSchema.extend({
  password: z.string().min(8)
});

const UpdateUserSchema = BaseUserSchema.partial().extend({
  id: UuidSchema
});
```

### Runtime Schema Generation

```typescript
// Generate schemas dynamically
const createPaginatedSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    ...PaginationSchema.shape,
    total: z.number().int().min(0)
  });

const PaginatedUsersSchema = createPaginatedSchema(UserSchema);
```

## Best Practices

1. **Define schemas close to usage**: Keep schemas near controllers/handlers
2. **Use type inference**: Leverage `z.infer<typeof Schema>` for TypeScript types
3. **Compose schemas**: Build complex schemas from simpler, reusable ones
4. **Handle errors gracefully**: Use the built-in error formatting
5. **Cache schemas**: For performance, avoid recreating schemas in hot paths
6. **Use defaults**: Set sensible defaults in schemas for optional fields

## Migration from class-validator

### Before (class-validator)
```typescript
import { IsString, IsEmail, IsInt, Min, Max } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsInt()
  @Min(18)
  @Max(120)
  age: number;
}
```

### After (Zod)
```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  age: z.number().int().min(18).max(120)
});

type CreateUserDto = z.infer<typeof CreateUserSchema>;
```

## Performance Considerations

- Schemas are compiled once and reused
- Validation is performed synchronously for better performance
- Minimal memory overhead compared to class-validator
- Built-in caching for repeated validations

## Troubleshooting

### Common Issues

1. **Schema not found**: Ensure the decorator is applied to the correct method
2. **Type mismatch**: Check that your schema matches the expected data structure
3. **Global interceptor not working**: Verify `ValidationModule.forRoot()` is imported
4. **Path alias not working**: Check `tsconfig.json` path mappings

### Debug Mode

Enable debug logging to troubleshoot validation issues:

```typescript
ValidationModule.forRoot({
  debug: true // Enable detailed logging
})
```
