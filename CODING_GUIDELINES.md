# 🧑‍💻 Coding Guidelines - AI Procurement Agent

This project follows **Clean Architecture** with **Domain-Driven Design (DDD)** patterns, orchestrated by **Temporal Workflows** and powered by **LangGraph AI agents**.

You can also reference this repo for similar patterns and practices:  
👉 [https://github.com/deresegetachew/play-ddd](https://github.com/deresegetachew/play-ddd)

---

## 🏗️ Architecture Overview

### Core Principles
- **Domain Events** drive the system flow
- **CQRS** separates reads from writes  
- **Event-driven architecture** for cross-boundary communication
- **Use Cases** contain business logic
- **Domain Event Handlers** manage side effects
- **NestJS RPC** (`ClientProxy.send()`) for internal service communication
- **Temporal Workflows** orchestrate complex processes

---

## 📂 Project Structure

```
procurment-agent/
├── apps/
│   ├── core-service/           # Main business logic service
│   │   ├── src/
│   │   │   ├── domain/                 # Pure business logic
│   │   │   │   ├── entities/           # RFQAggregate, etc.
│   │   │   │   ├── factories/          # RFQFactory
│   │   │   │   ├── events/             # Domain events
│   │   │   │   └── valueObjects/       # Domain value objects
│   │   │   │
│   │   │   ├── application/            # Orchestration logic
│   │   │   │   ├── useCases/           # Business use cases
│   │   │   │   ├── domainEventHandlers/ # Domain event reactions
│   │   │   │   └── ports/              
│   │   │   │       ├── incoming/       # Commands & handlers
│   │   │   │       └── outgoing/       # Repository interfaces
│   │   │   │
│   │   │   ├── infrastructure/         # Tech implementations
│   │   │   │   ├── database/           # MongoDB schemas
│   │   │   │   ├── messaging/          # Event bus clients
│   │   │   │   └── external/           # LangGraph, AI services
│   │   │   │
│   │   │   └── presenters/             # NestJS controllers
│   │   │       └── rpc/                # @MessagePattern handlers
│   │
│   ├── email-worker/           # Email processing service
│   ├── wf-engine/             # Temporal workflow orchestration
│   └── langgraph-service/     # AI agent processing
│
├── libs/
│   ├── common/                # Shared utilities, events, DTOs
│   ├── schema-validation/     # Zod schemas
│   └── temporal/              # Temporal workflow definitions
```

---

## 🎯 Domain-Driven Design Patterns

### 1. Domain Events (Internal - No Validation)
Events describe **what happened** in the domain (past tense):

```typescript
// ✅ Good - describes what happened
export class RFQParsedDomainEvt {
  constructor(
    public readonly threadId: string,
    public readonly rfq: RFQAggregate,
  ) {}
}

export class RFQAttachmentsFoundDomainEvt {
  constructor(
    public readonly threadId: string,
    public readonly rfqAggregate: RFQAggregate,
  ) {}
}

// ❌ Bad - sounds like a command
export class ParseRFQAttachmentsEvt {} 
```

**Rules:**
- Use past tense naming (`Found`, `Parsed`, `Created`, `Updated`)
- No schema validation needed (internal, trusted events)
- Include relevant aggregate data
- TypeScript provides compile-time safety

### 2. Commands (External Entry Points - Always Validate)
Commands represent **intent to do something** (imperative):

```typescript
// Command with schema validation
export const SendConfirmationMessageCommandSchema = z.object({
  threadId: z.string().min(1, 'Thread ID is required'),
  rfq: z.instanceof(RFQAggregate),
});

type SendConfirmationMessageCommandSchemaType = z.infer<
  typeof SendConfirmationMessageCommandSchema
>;

export class SendConfirmationMessageCommand extends Command<void> {
  constructor(
    public readonly threadId: string,
    public readonly rfq: RFQAggregate,
  ) {
    super();
  }
}
```

**Rules:**
- Always include Zod schema validation
- Use imperative naming (`Send`, `Parse`, `Create`, `Update`)
- Can be called from external sources (APIs, RPC, etc.)
- Validate at service boundaries

### 3. Integration Events (Cross-Boundary - Validate)
Events that cross service boundaries:

```typescript
export const AttachmentParsingRequestedEvtSchema = z.object({
  service: z.string(),
  payload: z.object({
    threadId: z.string(),
  }),
});

export class AttachmentParsingRequestedEvt {
  constructor(
    public readonly service: string,
    public readonly payload: { threadId: string },
  ) {}
}
```

---

## 🔄 Event Flow Patterns

### 1. Internal Domain Flow
```
Use Case → Aggregate → Domain Event → Event Handler → Command → Use Case
```

Example:
```typescript
ParseEmailIntentUseCase 
  → RFQAggregate.addRFQParsedEvt() 
  → RFQParsedDomainEvt 
  → SendConfirmationEmailHandler 
  → SendConfirmationMessageCommand 
  → SendConfirmationMessageUseCase
```

### 2. Cross-Boundary Integration
```
Domain Event → Event Handler → Integration Event → External Service
```

Example:
```typescript
RFQAttachmentsFoundDomainEvt 
  → RFQAttachmentsParsingRequestedHandler 
  → AttachmentParsingRequestedEvt 
  → Message Broker 
  → External Attachment Service
```

### 3. Temporal Workflow Orchestration
```
Temporal Workflow → Activity → NestJS RPC → Use Case → Domain Events
```

Example:
```typescript
getUnreadEmailsWF 
  → parseEmailIntentActivity 
  → ClientProxy.send('parse-email-intent') 
  → ParseEmailIntentUseCase 
  → Domain Events
```

---

## 🎭 Event Handler Patterns

### Domain Event Handlers

#### Pattern 1: Delegate to Use Case (Complex Logic)
```typescript
@EventsHandler(RFQParsedDomainEvt)
export class SendConfirmationEmailOnParsedRFQHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: RFQParsedDomainEvt): Promise<void> {
    try {
      // Delegate complex logic to use cases via commands
      await this.commandBus.execute(
        new SendConfirmationMessageCommand(event.threadId, event.rfq)
      );
    } catch (error) {
      this.logger.error('Error handling RFQParsed event', { error, threadId: event.threadId });
      // Don't rethrow - event handling failures shouldn't break the flow
    }
  }
}
```

#### Pattern 2: Direct Action (Simple Side Effects)
```typescript
@EventsHandler(RFQAttachmentsFoundDomainEvt)
export class RFQAttachmentsParsingRequestedHandler {
  constructor(
    @Inject(INTEGRATION_EVENT_CLIENT)
    private readonly eventBusClient: EventPublisher,
  ) {}

  async handle(event: RFQAttachmentsFoundDomainEvt): Promise<void> {
    try {
      // Direct integration event publishing is OK for simple side effects
      const evt = new AttachmentParsingRequestedEvt('core-service', {
        threadId: event.threadId,
      });
      
      this.eventBusClient.publish(evt, {});
      this.logger.log(`Attachment parsing requested for thread: ${event.threadId}`);
    } catch (error) {
      this.logger.error('Error handling AttachmentsFound event', { error, threadId: event.threadId });
    }
  }
}
```

**When to use Commands vs Direct Action:**
- **Use Commands** for: Complex business logic, reusable operations, state changes
- **Direct Action** for: Simple side effects, integration events, logging, notifications

---

## 🚀 Service Communication

### NestJS RPC (Internal Services)
```typescript
// Temporal Activity → Core Service
const result = await this.coreServiceClient.send('parse-email-intent', {
  threadId,
  emailData,
}).toPromise();

// Core Service → LangGraph Service  
const aiResponse = await this.langGraphClient.send('process-email-intent', {
  emailContent,
  threadId,
}).toPromise();

// Message Pattern Handlers
@MessagePattern('parse-email-intent')
async parseEmailIntent(data: ParseEmailIntentRequestDTO): Promise<ParseEmailIntentResponseDTO> {
  return this.parseEmailIntentUseCase.execute(new ParseEmailIntentCommand(data));
}
```

### Integration Events (Cross-Boundary)
```typescript
// Publish integration events via message broker
this.eventBusClient.publish(
  new AttachmentParsingRequestedEvt('core-service', { threadId }),
  {}
);
```

---

## 📊 Schema Validation Strategy

### ✅ Always Validate
- **Commands** (external entry points)
- **Integration Events** (cross-boundary)
- **DTOs** (service communication)
- **AI Responses** (never trust LLM output)

```typescript
// Command validation
export const ParseEmailIntentCommandSchema = z.object({
  threadId: z.string().min(1),
  emailData: z.object({
    subject: z.string(),
    content: z.string(),
    // ... other fields
  }),
});

// AI response validation
export const EmailIntentResponseSchema = z.object({
  isRFQ: z.boolean(),
  requestSummary: z.string().optional(),
  hasAttachments: z.boolean(),
  // ... other fields
});
```

### ❌ No Validation Needed
- **Domain Events** (internal, trusted)
- **Value Objects** (TypeScript provides safety)
- **Aggregates** (internal domain objects)

```typescript
// Domain event - no validation needed
export class RFQParsedDomainEvt {
  constructor(
    public readonly threadId: string,
    public readonly rfq: RFQAggregate,
  ) {}
}
```

---

## 🤖 AI Integration with LangGraph

### AI Response Handling
```typescript
// Always validate AI responses
const parseEmailResponse = await this.langGraphClient.send('process-email-intent', emailData);

// Validate the response
const validatedResponse = EmailIntentResponseSchema.parse(parseEmailResponse);

// Use in domain logic
const rfq = RFQFactory.CUFromEmailIntentDTO(validatedResponse, existingRFQ);
```

### Prompt Structure
```typescript
// LangGraph nodes should be composable and validated
interface PromptNode {
  name: string;
  llm: LLMInstance;
  schema: ZodSchema;
  prompt: string;
}

// Examples:
- SummarizeEmailPrompt
- ClassifyEmailAsRFQPrompt  
- ExtractRFQDetailsPrompt
- DetectAttachmentsPrompt
```

---

## ⏰ Temporal Workflow Patterns

### Workflow Naming
- Use descriptive names: `getUnreadEmailsWF`, `processEmailThreadWF`
- End with `WF` suffix

### Activity Structure
```typescript
// Activities should be focused and single-purpose
export async function parseEmailIntentActivity(
  ctx: Context,
  input: { threadId: string; emailData: any }
): Promise<ParseEmailIntentResponseDTO> {
  // Delegate to use case via RPC
  return await ctx.dependencies.coreServiceClient
    .send('parse-email-intent', input)
    .toPromise();
}
```

### Workflow Orchestration
```typescript
export async function processEmailThreadWF(
  input: ProcessEmailThreadInput
): Promise<void> {
  const { threadId, emailData } = input;

  // Check if already processed
  if (emailData.isDone) {
    return;
  }

  // Parse email intent
  const intentResult = await ctx.run(parseEmailIntentActivity, {
    threadId,
    emailData,
  });

  // Domain events will handle side effects automatically
}
```

---

## 📏 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Domain Events** | Past tense + `DomainEvt` | `RFQParsedDomainEvt`, `AttachmentsFoundDomainEvt` |
| **Commands** | Imperative + `Command` | `SendConfirmationMessageCommand`, `ParseEmailIntentCommand` |
| **Event Handlers** | Descriptive + `Handler` | `SendConfirmationEmailOnParsedRFQHandler` |
| **Use Cases** | Action + `UseCase` | `ParseEmailIntentUseCase`, `SendConfirmationMessageUseCase` |
| **Aggregates** | Noun + `Aggregate` | `RFQAggregate`, `EmailThreadAggregate` |
| **Factories** | Noun + `Factory` | `RFQFactory`, `EmailThreadFactory` |
| **Workflows** | Action + `WF` | `getUnreadEmailsWF`, `processEmailThreadWF` |
| **Activities** | Action + `Activity` | `parseEmailIntentActivity`, `getUnreadEmailsActivity` |

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('RFQFactory', () => {
  it('should create RFQ from email intent and emit domain events', () => {
    const emailIntent = createMockEmailIntent();
    const rfq = RFQFactory.CUFromEmailIntentDTO(emailIntent);
    
    expect(rfq.getUncommittedEvents()).toContain(RFQParsedDomainEvt);
    if (emailIntent.hasAttachments) {
      expect(rfq.getUncommittedEvents()).toContain(RFQAttachmentsFoundDomainEvt);
    }
  });
});
```

### Integration Tests
```typescript
describe('ParseEmailIntentUseCase', () => {
  it('should process email and emit appropriate domain events', async () => {
    const command = new ParseEmailIntentCommand(mockEmailData);
    await useCase.execute(command);
    
    // Verify domain events were published
    expect(eventBus.publishedEvents).toContainEventOfType(RFQParsedDomainEvt);
  });
});
```

---

## 🔍 Error Handling

### Use Cases
```typescript
export class ParseEmailIntentUseCase {
  async execute(command: ParseEmailIntentCommand): Promise<ParseEmailIntentResponseDTO> {
    try {
      // Business logic
      const result = await this.processEmailIntent(command);
      return result;
    } catch (error) {
      this.logger.error('Failed to parse email intent', { 
        error, 
        threadId: command.threadId 
      });
      throw new DomainException('Email parsing failed', error);
    }
  }
}
```

### Event Handlers
```typescript
async handle(event: RFQParsedDomainEvt): Promise<void> {
  try {
    // Handle event
    await this.handleEvent(event);
  } catch (error) {
    this.logger.error('Error handling RFQParsed event', { 
      error, 
      threadId: event.threadId 
    });
    // Don't rethrow - event handling failures shouldn't break the main flow
  }
}
```

### Temporal Activities
```typescript
export async function parseEmailIntentActivity(
  ctx: Context,
  input: ParseEmailIntentInput
): Promise<ParseEmailIntentResponseDTO> {
  try {
    return await ctx.dependencies.coreServiceClient
      .send('parse-email-intent', input)
      .toPromise();
  } catch (error) {
    // Temporal will handle retries based on retry policy
    throw ApplicationFailure.nonRetryable('Failed to parse email intent', error);
  }
}
```

---

## 🛠️ Technology Stack

- **🔄 Temporal** - Workflow orchestration & scheduling
- **🚀 NestJS** - Microservices framework with built-in RPC via `ClientProxy`
- **🤖 LangGraph** - AI agent workflow management  
- **📊 Zod** - Schema validation for all data boundaries
- **📧 Gmail API** - Email integration
- **🗄️ MongoDB + Mongoose** - Data persistence
- **⚡ Redis** - Message broker for integration events
- **🧠 OpenAI/Claude** - LLM providers

---

## ✅ Best Practices Summary

### DDD Recommendations
1. **UseCase owns transactions** ✅
2. **Aggregate owns invariants and fires domain events** ✅  
3. **Domain Event signals that something happened** ✅
4. **Event Handler triggers workflows, notifications, etc.** ✅

### Event Flow
```
1. Service triggers Command (e.g., ParseEmailIntentCommand)
   ↓
2. Use Case handles it (ParseEmailIntentUseCase)
   ↓
3. Aggregate applies logic → emits Domain Event (RFQParsedDomainEvt)
   ↓
4. Event Handler listens to domain event
   ↓
5. Event Handler calls another Use Case (SendConfirmationMessageUseCase)
```

### Schema Validation Rules
- **Domain events are internal** - no validation needed ❌
- **Commands are external entry points** - always validate ✅
- **Integration events cross boundaries** - validate ✅
- **AI responses must be validated** - never trust LLM output ✅
- **DTOs for service communication** - validate ✅

### Architecture Decisions
1. **Event-driven architecture** drives all side effects
2. **NestJS RPC** for fast internal communication
3. **Temporal workflows** for reliable orchestration
4. **LangGraph** for AI agent decision flows  
5. **Clean Architecture** keeps domain logic pure
6. **CQRS** separates commands from queries
7. **Message broker** for cross-service integration

---

## 🔗 References

This project aligns with examples found in:  
👉 [https://github.com/deresegetachew/play-ddd](https://github.com/deresegetachew/play-ddd)