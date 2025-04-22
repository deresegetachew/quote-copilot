 # 🧑‍💻 Coding Guidelines
 
 This project follows a combination of **Clean Architecture** and **Hexagonal Architecture (Ports and Adapters)** to maintain a clear separation of concerns and allow long-term scalability, testability, and modularity.
 
 You can also reference this repo for similar patterns and practices:  
 👉 [https://github.com/deresegetachew/play-ddd](https://github.com/deresegetachew/play-ddd)
 
 ---
 
 ## 📂 Folder Structure
 
 Each app (e.g. `email-worker`, `telegram-worker`) is organized as follows:
 
 ```
 src/
 ├── domain/                 # Pure business logic
 │   ├── entities/           # Domain models like EmailMessage, Quote, etc.
 │   ├── factories/          # Builds complex domain objects
 │   └── valueObjects/      # Types with rules (e.g. EmailThreadId)
 │
 ├── application/            # Orchestration logic
 │   ├── useCases/          # Each file handles one operation (e.g. ProcessEmailUseCase)
 │   ├── domainEventHandlers/ # Responds to domain events raised by aggregates
 │   ├── integrationEventHandlers/ # Responds to external events (e.g. Temporal, messaging bus)
 │   └── ports/              # 
 │       ├── incoming/       # Defines command/query handlers (e.g. NestJS CQRS based)
 │       └── outgoing/       # Contains contracts for repositories, agents, services (used via IoC)
 │
 ├── infrastructure/         # Tech-specific implementations
 │   ├── gmail/              # e.g. Gmail API integration
 │   ├── db/                 # e.g. MongoDB adapters
 │   └── external/           # e.g. LangGraph, Temporal, or third-party SDKs
 │
 ├── presenters/             # Input interfaces (driving adapters)
 │   ├── http/               # Webhook entrypoints
 │   └── polling/            # Periodic pollers or CLI-based inputs
 │
 └── main.ts                 # Bootstraps dependencies, use cases, controllers
 ```
 
 ---
 
 ## ✅ Layer Responsibilities
 
 ### `domain/`
 - Contains the **core rules of the system**
 - No framework code allowed (pure TS)
 - Defines core entities, value objects, and factories — no interfaces or contracts
 
 ### `application/`
 - Coordinates logic across domain and external systems
 - Should use only interfaces from `domain/`
 - Contains:
   - `use-cases/`: Application service classes
   - `domainEventHandlers/`: Responds to domain events raised by aggregates
   - `integrationEventHandlers/`: Responds to external events (e.g. Temporal, messaging bus)
   - `ports/`:
     - `incoming/`: Defines command/query handlers (e.g. NestJS CQRS based)
     - `outgoing/`: Contains contracts for repositories, agents, services (used via IoC)
 - Contains only use cases, no business logic or infra code
 
 ### `infrastructure/`
 - Implements interfaces from domain (e.g. `EmailRepository`)
 - Uses external services like Gmail API, Mongo, Redis, etc.
 
 ### `presenters/`
 - Adapts incoming inputs (HTTP, polling, CLI) to application use cases
 - Responsible for translating raw messages into structured objects
 
 ---
 
 ## 📏 Naming Conventions
 
 | Type            | Convention               | Example                            |
 |-----------------|--------------------------|------------------------------------|
 | Use Case        | `XyzUseCase`             | `ProcessIncomingEmailUseCase`      |
 | Entity          | Noun-style class name    | `EmailMessage`, `QuoteRequest`     |
 | Repository Impl | Suffix `Adapter`/`Client`| `GmailAdapter`, `MongoThreadStore` |
 | Controller      | Suffix `Controller`      | `EmailWebhookController`           |
 | Poller/CLI      | Suffix `Poller`          | `GmailPoller`                      |
 
 ---
 
 ## 🧰 Design Tips
 
 - Use **constructor injection** via interfaces
 - Test domain logic and use cases in isolation
 - Wrap LLM, LangGraph, or Temporal calls in infrastructure adapters
 - Avoid fat "services" — prefer clear role-based classes (factories, use cases, strategies)
 
 ---
 
 ## 🔍 Additional Practices
 
 - 🧠 Write prompts as `.hbs` templates with dedicated folders per use case
 - 📄 Prompt structure includes: user/system prompt, response format, examples
 - 🧪 Add tests to domain and application layers
 - 🧼 Group reusable helpers in `libs/common/`
 
 ---
 
 ## 🛠️ Shared Patterns & References
 
 This project aligns with examples found in:  
 👉 [https://github.com/deresegetachew/play-ddd](https://github.com/deresegetachew/play-ddd)
 
 ---