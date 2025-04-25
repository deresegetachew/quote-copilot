# 🧠 Agent Orchestrator - Temporal Workflows Guide

## 📦 What This Module Does
This app defines and runs Temporal workflows that orchestrate end-to-end email-based automation flows (e.g., Procurement, Customer Support). Each workflow coordinates various agents and logic blocks using Temporal's durable execution model.

---

## 🧬 Concepts in Temporal

### 🔁 Workflows
- Long-running, durable functions orchestrated by Temporal.
- Handle control flow, decisions, branching, retries.
- ❌ Cannot do I/O (DB, HTTP, etc.).
- ✅ Always deterministic — can be replayed safely.

### ⚙️ Activities
- Do all the real-world work (DB, API calls, file I/O).
- Called from workflows via `proxyActivities()`.
- Run in separate processes with timeouts and retries.

### 🔗 Child Workflows
- A workflow that is launched from another workflow using `executeChild()`.
- Ideal for isolating concerns (e.g., processing RFQ separately).
- Have their own state, retries, failures, signals.

### ⚡ Inline Execution
- Just calling another function inside a workflow.
- Used when the called function is pure and doesn't need isolation.
- ❌ Not durable or separately observable.

---

### 📩 Signals
- Signals are messages you can send **into** a running workflow.
- Used to notify the workflow of external events (e.g., "new message", "user replied").
- In our app, we use `defineSignal()` to declare signals like:
  - `NEW_MESSAGE`
  - `COMPLETE_THREAD`
- You can call `.signalWithStart()` or `.signal()` from your adapter or use cases to communicate with workflows at runtime.
- Signals are **durable** and queued — even if the workflow is busy or sleeping.

---

## 🔨 Helper: `executeWorkflow()`

Use this helper inside workflows to abstract `executeChild` or inline execution:

```ts
await executeWorkflow(myWorkflowFn, {
  args: [arg1, arg2],
  asChild: true,
  workflowId: 'child-abc'
});
```

- `asChild: true` → uses `executeChild()` (durable, tracked)
- `asChild: false` or omitted → calls inline like a normal function

This helps keep workflow code clean and flexible.

---

## ✅ When to Use What

| Scenario                        | Use...               |
|-------------------------------|----------------------|
| Orchestrating long-lived logic | ✅ Workflow           |
| Calling a DB or API            | ✅ Activity           |
| Replaying logic deterministically | ✅ Workflow         |
| Launching a modular subprocess | ✅ Child Workflow     |
| Just a helper function         | ✅ Inline call        |

---

## 🏗 Deployment & Scaling

### 🧵 Multiple Worker Instances

Running multiple instances of the Agent Orchestrator app is fully supported and encouraged for scalability and reliability. Each instance connects to the same Temporal cluster and listens on the same `taskQueue`.

Temporal uses a **pull-based model** — workers **poll** the server for available tasks. This enables automatic load balancing: the server doesn't push tasks to workers, it waits for them to pull.

### ⚖️ Load Balancing Behavior

- Tasks are distributed fairly across available worker instances.
- Workers that are faster or less busy naturally take on more tasks.
- If a worker crashes or disconnects, other workers continue processing.

This makes it easy to horizontally scale just by spinning up more worker processes or containers.

### 💥 Fault Tolerance & Recovery

- Activities and workflows are retried according to policies you define.
- If a worker crashes mid-task, Temporal will reassign the task to another worker.
- Long-running workflows remain safe and paused — no need for sticky sessions or manual recovery.

This model helps you scale out your agents confidently while minimizing operational headaches.

---
