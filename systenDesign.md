# System Design - AI Procurement Agent

## 📬 Email Processing Flow

This flow outlines how unread emails are fetched, parsed, classified as RFQ or not, summarized and finally parsed to structured data with domain events driving side effects.

---

## 🟥 WF Engine (Temporal)

- **Workflow**: `getUnreadEmailsWF`
- **Trigger**: Every 2 minutes via cron schedule
- **Action**:
  - Starts `getUnreadEmailsActivity`
  - Sends RPC request to **Email Worker** via NestJS ClientProxy
- **Then**: Starts `processEmailThreadWF` for each email thread
- **Decision**:
  - If thread `isDone` → **End**
  - Else → run `parseEmailIntentActivity`

---

## 🟪 Email Worker

- **Handles NestJS RPC requests** via `@MessagePattern()`
- **Pattern**: `'get-unread-emails'`
- Executes `GetUnreadEmailsUseCase`
- Returns unread email threads to WF Engine
- Uses Gmail API integration

---

## 🟥 WF Engine (continued)

- Executes `parseEmailIntentActivity`
- Sends RPC request to **Core Service** via NestJS ClientProxy
- **Pattern**: `'parse-email-intent'`
- Passes email thread data for AI processing

---

## 🟩 Core Service

### Main Flow:
1. **Receives RPC**: `@MessagePattern('parse-email-intent')`
2. **Executes**: `ParseEmailIntentUseCase`
3. **AI Processing**: Delegates to LangGraph service for agentic parsing
4. **Domain Logic**: Creates/updates RFQ aggregate
5. **Domain Events**: Emits events that trigger side effects

### Domain Event Flow:
```
ParseEmailIntentUseCase → RFQFactory.CUFromEmailIntentDTO() → RFQAggregate
  ↓
RFQAggregate.addRFQParsedEvt() → RFQParsedDomainEvt
  ↓
SendConfirmationEmailOnParsedRFQHandler → SendConfirmationMessageCommand
  ↓
SendConfirmationMessageUseCase (executes confirmation logic)

RFQAggregate.addRFQAttachmentsFoundEvt() → RFQAttachmentsFoundDomainEvt  
  ↓
RFQAttachmentsParsingRequestedHandler → AttachmentParsingRequestedEvt (Integration Event)
```

### Key Components:
- **RFQ Factory**: Creates RFQ aggregates from email intent DTOs
- **Domain Events**: Drive side effects (confirmation emails, attachment processing)
- **Event Handlers**: Coordinate between domain and external services
- **Integration Events**: Cross-boundary communication via message broker

---

## 🟨 LangGraph AI Service

- **Communication**: NestJS RPC via ClientProxy
- **Agentic Flow**: Multi-step AI processing pipeline
- **Steps**:
  1. 🧠 **Summarize Email Content**
  2. 🏷️ **Classify as RFQ** (binary decision)
  3. 📋 **Extract RFQ Details** (if classified as RFQ)
  4. 📎 **Detect Attachments**

### AI Prompts:
- `SummarizePrompt` - Email content summarization
- `ClassifyEmailAsRFQPrompt` - RFQ classification
- `ExtractRFQDetailsPrompt` - Structured data extraction
- Each uses LLM + Zod schema validation

---

## 🔄 Event-Driven Architecture

### Domain Events (Internal):
- `RFQParsedDomainEvt` - RFQ successfully parsed from email
- `RFQAttachmentsFoundDomainEvt` - Attachments detected in RFQ

### Integration Events (Cross-Boundary):
- `AttachmentParsingRequestedEvt` - Request external attachment processing

### Event Handlers:
- **Domain Event Handlers**: React to internal domain changes
- **Command Handlers**: Execute business use cases
- **Integration Handlers**: Coordinate with external services

---

## 🏗️ Service Communication

### Internal RPC (NestJS Microservices):
```typescript
// WF Engine → Email Worker
this.emailWorkerClient.send('get-unread-emails', { batchSize: 50 })

// WF Engine → Core Service  
this.coreServiceClient.send('parse-email-intent', { threadId, emailData })

// Core Service → LangGraph
this.langGraphClient.send('process-email-intent', emailContent)
```

### Message Broker (Integration Events):
```typescript
// Cross-service communication
this.eventBusClient.publish(
  new AttachmentParsingRequestedEvt('core-service', { threadId }),
  {}
)
```

---

## 🧩 System Architecture

### Services:
- **🟥 WF Engine**: Temporal workflow orchestration
- **🟪 Email Worker**: Gmail integration & email fetching  
- **🟩 Core Service**: Domain logic, RFQ management, event coordination
- **🟨 LangGraph Service**: AI-powered email processing

### Communication Patterns:
- **NestJS RPC** (`ClientProxy.send()`) for internal service calls
- **Message Broker** for integration events
- **Domain Events** for internal side effects
- **CQRS** for command/query separation

### Data Flow:
```
Gmail API → Email Worker → WF Engine → Core Service → LangGraph → AI Processing
    ↓
Domain Events → Event Handlers → Side Effects (emails, integrations)
```

---

## 🛠️ Technology Stack

- **🔄 Temporal** - Workflow orchestration & scheduling
- **🚀 NestJS** - Microservices framework with built-in RPC
- **🤖 LangGraph** - AI agent workflow management  
- **📊 Zod** - Schema validation for all data boundaries
- **📧 Gmail API** - Email integration
- **🗄️ MongoDB + Mongoose** - Data persistence
- **⚡ Redis** - Message broker for integration events
- **🧠 OpenAI/Claude** - LLM providers

---

## 🎯 Key Design Decisions

1. **Event-Driven**: Domain events drive all side effects
2. **CQRS**: Commands for writes, queries for reads
3. **Clean Architecture**: Domain logic isolated from infrastructure  
4. **Microservices**: Each service has single responsibility
5. **AI-First**: LangGraph manages complex AI decision flows
6. **Temporal**: Reliable workflow orchestration with retries
7. **NestJS RPC**: Fast internal communication without gRPC complexity
8. **Schema Validation**: Zod at all service boundaries