# AI Agents Monorepo — Multi-Tenant LLM Framework

This project implements a modular AI agent platform designed for automating domain-specific workflows such as procurement, customer support, compliance, and more.

## 🧠 Project Goal

Build an LLM-powered, multi-tenant agent framework that:
- Parses incoming data (e.g. emails, messages)
- Extracts structured information based on configurable logic
- Interfaces with internal systems (e.g. inventory, CRM, ticketing)
- Generates outputs like quotes, confirmations, summaries, or follow-ups
- Supports reusable prompt templates per tenant and use case

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

## 🧑‍💻 Supported Agents (Examples)

- 🛒 **Procurement Agent** – Email parsing, supplier quoting, order confirmations
- 💬 **Customer Support Agent** – Ticket classification, suggested replies
- 📄 **Compliance Agent** – Policy interpretation, document flagging
- 🔧 Easily extendable with new agents per use case

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
