# Event Inbox Library

A zero-configuration library for ensuring **exactly-once processing** of events in distributed systems with automatic cleanup of processed messages.

## Features

- 🔐 **Exactly-once processing** with database-level deduplication
- 🚀 **Zero configuration** - works out of the box
- 🧹 **Automatic cleanup** via database triggers
- ⚡ **High performance** with optimized indexes
- 🏗️ **NestJS integration** with decorators and interceptors

---

## Quick Start

### 1. Installation

```bash
npm install @your-org/event-inbox
```

### 2. Import the Module

```typescript
import { Module } from '@nestjs/common';
import { EventInboxModule } from '@your-org/event-inbox';

@Module({
  imports: [
    EventInboxModule.register({
      // Your MikroORM configuration
    }),
  ],
})
export class AppModule {}
```

### 3. Use the Decorator

```typescript
import { EventInboxHandler } from '@your-org/event-inbox';

export class EventProcessor {
  @EventInboxHandler('user.created')
  async handleUserCreated(payload: { userId: string; email: string }): Promise<void> {
    console.log('Processing user creation:', payload);
    // Your business logic here - guaranteed to run exactly once
  }
}
```

## How It Works

### Exactly-Once Processing

The library automatically:

1. **Tracks messages** in a database table with unique constraints
2. **Prevents duplicates** using event hash-based deduplication  
3. **Handles retries** by checking message status before processing
4. **Manages failures** with proper error states and retry logic

### Automatic Cleanup

- **Database triggers** automatically remove expired + processed messages
- **Zero overhead** - no background jobs or scheduled tasks needed
- **Optimized indexes** ensure fast cleanup operations
- **Production ready** - handles high-throughput scenarios

### Competing Consumers

When multiple instances process the same event:
- Only one consumer succeeds in marking the message as "processing"
- Other consumers skip the duplicate event
- Failed processing allows retries by other consumers
