# AI Agents Monorepo — Multi-Tenant LLM Framework

This project implements a modular AI agent platform designed for automating domain-specific workflows such as procurement, customer support, compliance, and more.

📚 For coding conventions and architectural guidelines, see [CODING_GUIDELINES.md](./CODING_GUIDELINES.md)

## 🧠 Project Goal

Build an LLM-powered, multi-tenant agent framework that:

- Parses incoming data (e.g. emails, messages)
- Extracts structured information based on configurable logic
- Interfaces with internal systems (e.g. inventory, CRM, ticketing)
- Generates outputs like quotes, confirmations, summaries, or follow-ups
- Supports reusable prompt templates per tenant and use case

## 📌 Problem Statement

Modern operations teams across industries — especially in domains like aviation, logistics, customer support, and compliance — are overwhelmed with unstructured or semi-structured communication channels.

These include:

- Emails
- PDFs and scanned forms
- WhatsApp or chat transcripts
- Web form submissions

These messages contain requests that must be understood, acted on, and tracked, but today this is handled manually — leading to:

- Delays and bottlenecks
- Error-prone interpretations
- High operational overhead
- Inconsistent responses and tracking

## 🚨 Case in Point: Procurement in Maintenance

When a customer sends an email requesting  parts, a specialist must:

1. Parse what is being asked (e.g. part number, quantity, deadline)
2. Check if the part is available internally
3. If not, submit a Request for Quotation (RFQ) to suppliers
4. Wait for hours or days for replies
5. Compare offers across price, certifications, and delivery
6. Generate a quote for the client
7. Handle delayed follow-ups, changes, or clarifications
8. Track everything in the ERP system

This process is semi-automated at best, and ripe for intelligent automation using LLMs and orchestration tools.

## 🧩 Solution: Modular, Multi-Tenant LLM Agent Framework

This project implements a solution by  building a pluggable agent system that combines:

- LLMs: for interpreting, summarizing, and communicating
- LangGraph: to model reasoning and branching flows
- Temporal: to orchestrate long-running workflows and external dependencies
- Handlebars prompt templates: for reusable and tenant-specific communication

### 🧠 Step-by-Step Solution Flow (Procurement Agent)

1. 📥 Parse the Customer Email

- Use an LLM to extract: 
  - Part Number(s) ,
  - Quantity , 
  - Desired delivery date, Handles free-form, multi-line input
- Supports thread of emails

1. 🏭 Check Internal Inventory

- Simulate or integrate with ERP
- If found, gather:
  - Price
  - Condition (new/OH/etc.)
  - Estimated time to deliver

1. 🔀 Branch Based on Availability

- ✅ If in stock → go to quote generation
- ❌ Else → launch external RFQ process

4. 🌐 Submit External RFQ (via Temporal)

- Publish request to multiple platforms (e.g. PartsBase, ILS)
- Store RFQ state per tenant/request
- Wait up to 72h (poll or webhook)
- Automatically resume once responses are in
- followup if no response or send new RFQ, and flag for human in the loop

5. 🧠 Analyze RFQ Offers

- Use LLM or logic to compare offers
- Sort by:
  - Certifications (EASA, FAA, etc.)
  - Price
  - Delivery time

6. 🧾 Generate the Quote

- Compose a client-facing quote using LLM prompt
  - Style, tone, and content customizable per tenant

7. 📬 Send Quote & Await Response

- Wait (via Temporal) for:
  - Approval
  - Clarification
  - Change request
  - If clarification → loop back to parsing with context

8. ✅ Confirm & Finalize Order

 - Once approved:
   - Trigger PO creation
   - Notify supplier
   - Update internal systems

---

## 📦 Project Structure

```
apps/
  api/                → NestJS backend for tenant and agent API
  email-listener/     → Email ingestion app (polling or webhook)
libs/
  agents/             → LangGraph/LLM agent workflows
  db/                 → MongoDB connection and schemas
  tenants/            → Tenant metadata, loader utils
  prompts/            → Prompt templates (Handlebars) and PromptBuilder classes
  common/             → Shared types, decorators, utilities
```

---

## 🧱 Prompt Design

Prompts are structured as modular Handlebars (`.hbs`) templates and organized per use case under:

```
libs/prompts/src/llmPrompts/<useCase>/templates/
```

Each prompt consists of the following components:

| Type              | File Name Example                   | Description                            |
|-------------------|--------------------------------------|----------------------------------------|
| System Prompt     | `generate-quote.system.hbs`         | Sets role/persona for LLM              |
| User Prompt       | `generate-quote.user.hbs`           | Task-specific instructions             |
| Description       | `generate-quote.description.hbs`    | What the prompt does (doc/dev use)     |
| Response Format   | `generate-quote.response-format.hbs`| Optional output structure guidance     |
| Example Input     | `generate-quote.example-input.hbs`  | (optional) Sample input                |
| Example Output    | `generate-quote.example-output.hbs` | (optional) Sample response             |

These are compiled into structured `PromptBody` objects using builder classes like:

```
libs/prompts/src/llmPrompts/<useCase>/PromptBuilder.ts
```

---

## 🚀 How to Run the Projects

This monorepo contains multiple applications and libraries. Below are the steps to run specific apps and manage the project:

### Prerequisites

Ensure you have the following installed:

- Node.js (v16 or later)
- npm or yarn
- NestJS CLI (`npm install -g @nestjs/cli`)

### Running a Specific App

Each app is located under the `apps/` directory. To run a specific app, follow these steps:

1. Navigate to the root of the project.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project (optional, for TypeScript compilation):
   ```bash
   npm run build
   ```
4. Run the desired app using the NestJS CLI:
   ```bash
   nest start <app-name>
   ```
   Replace `<app-name>` with the name of the app (e.g., `api`, `email-workers`, `telegram-workers`, etc.).

   Example:
   ```bash
   nest start email-workers
   ```

### Running All Apps

To run all apps in the monorepo simultaneously, you can use the following command:
```bash
npm run start:all
```

### Watching for Changes

To enable hot-reloading during development, use the `--watch` flag:
```bash
nest start <app-name> --watch
```

### Running Tests

Each app has its own test suite located under the `test/` directory. To run tests for a specific app:

1. Navigate to the app's directory:
   ```bash
   cd apps/<app-name>
   ```
2. Run the tests:
   ```bash
   npm test
   ```

### Managing Libraries

Libraries are located under the `libs/` directory. To build a specific library:

1. Navigate to the root of the project.
2. Run the build command for the library:
   ```bash
   nest build <library-name>
   ```
   Replace `<library-name>` with the name of the library (e.g., `config`, `agents`, etc.).

   Example:
   ```bash
   nest build config
   ```

### Environment Configuration

The project uses a centralized configuration file located in the `libs/config` library. Ensure you have the `local.config.yml` file in place under `libs/config/src` before running the apps.

---

## 🚧 Status

- ✅ Monorepo scaffolded (NestJS CLI)
- ✅ Tenants and prompts structured
- ✅ Prompt builders implemented
- ✅ Handlebars templates supported

---

## 🛠️ Next Steps

- Integrate LangGraph flows for advanced agent reasoning
- Implement Temporal-based background orchestration
- Add Slack/email hooks for notifications
- Build UI/CLI for configuring agents per tenant

---

## 👥 Authors

Built by [Derese](https://www.linkedin.com/in/derese-g-56a72061/), powered by LLMs 🧠
