# Architecture: The Bulletproof Agent Shell

## 1. Executive Summary

The Bulletproof Agent Shell is a core architectural pattern designed to ensure the reliability and observability of the agentic evaluation system. Its primary responsibility is to guarantee that every background agent execution, regardless of its outcome (success, timeout, or unexpected crash), results in a definitive final status (`completed` or `failed`) being recorded in the database.

This architecture prevents the "stuck pending" state that was identified as a critical failure mode, where an agent crash would leave the entire evaluation workflow in an indeterminate state, blocking all subsequent processes.

## 2. The Problem: Silent Failures & Stalled Workflows

The previous architecture allowed individual agents to manage their own top-level error and timeout handling. A flaw in an agent's `try...catch` logic or an unhandled promise rejection could cause the Node.js process to terminate silently.

This had two major negative impacts:
- **Stalled Evaluations:** The orchestrator would wait indefinitely for a completion signal that would never arrive, freezing the entire slow agent pipeline.
- **Lack of Observability:** The system had no record of *why* the agent failed. It was impossible to distinguish between a long-running agent and a crashed one, making debugging and diagnostics incredibly difficult.

## 3. The Solution: A Centralized, Guarantee-Oriented Wrapper

The Bulletproof Agent Shell solves this by centralizing error handling at the highest possible level within the background function (`background-agents.ts`). It wraps every agent execution in a robust shell that makes one simple guarantee: **a final status will always be set.**

### Key Components:

- **`executeAgentSecurely` Function:** A dedicated function in `background-agents.ts` that acts as the shell. It encapsulates the entire agent execution lifecycle.
- **Master `try...catch...finally` Block:** The cornerstone of the architecture.
  - The **`try`** block attempts the agent execution. If successful, it records the `completed` status.
  - The **`catch`** block is the primary failure handler. If any error (including a timeout) occurs, it immediately records a `failed` status with a detailed error message.
  - The **`finally`** block is the ultimate guarantee. It *always* runs and performs a final check. If, for any conceivable reason, a status has not been recorded, it forcefully marks the execution as `failed`. This closes the final loophole for silent failures.
- **Centralized Timeout Management:** The timeout is no longer managed by individual agents. The shell initiates the agent's `execute` method and races it against a timeout promise. This ensures consistent timeout behavior across all agents.

### Diagram: Bulletproof Shell Workflow

```mermaid
graph TD
    subgraph "Bulletproof Agent Shell (within background-agents.ts)"
        direction LR
        A[Start 'executeAgentSecurely'] --> B{try};
        B -- Success --> C[agent.execute()];
        C --> D[Shell records 'completed' in DB];
        
        B -- Failure (e.g., Timeout, Crash) --> E{catch};
        E --> F[Shell records 'failed' with error details in DB];
        
        subgraph "Guaranteed Final Step"
            G{finally};
        end
        
        D --> G;
        F --> G;

        G --> H{Execution Status Recorded?};
        H -- Yes --> I[End Execution];
        H -- No (Edge Case) --> J[Force 'failed' status];
        J --> I;
    end

    A_In[Agent Request Received] --> A;
    I --> Z_Out[Return 200 OK to Orchestrator];
    J --> Z_Out;

    style A fill:#cde4f9
    style B fill:#d4edda
    style E fill:#f9d0c6
    style G fill:#fcf8e3
    style J fill:#f9d0c6,stroke:#b85c5c,stroke-width:2px
```

## 4. Business Impact: From Brittle to Diagnostic

This architectural change transforms agent failures from a system-breaking bug into a valuable diagnostic signal.

- **If the `crawl_agent` fails:** The system does not hang. Instead, the failure is logged, and other agents (the "probes") continue their work.
- **The Final Score's Meaning:** The resulting score becomes a **"Public Perception Score."** A low overall score, paired with a "Crawl Failed" alert, provides a clear, actionable insight for business leaders: the brand's public reputation can be measured, but its foundational web infrastructure is inaccessible to AI, representing a critical business risk.
- **Actionable Insights:** Instead of a cryptic, stalled process, stakeholders now receive a clear report that distinguishes between infrastructure failures (a failed crawl) and perception issues (the results of the probe agents). This allows technical and marketing teams to prioritize their efforts effectively.

By making the system resilient, we have also made its failures informative, thereby increasing the overall value and trustworthiness of the evaluation platform.