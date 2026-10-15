---
name: cua-qa
description: Set up and use a dedicated Cua Space for application QA without controlling the user's desktop or personal browser. Use for isolated web, Linux desktop or Electron testing, reproducible QA environments, and bounded long-running test sessions.
license: MIT
---

# Cua QA

Give the agent a dedicated test computer. Keep the user's applications, sessions and input devices out of the test loop.

## Start with the smallest working path

1. Identify the app/build, expected behavior, execution host and target OS/architecture. Reuse an explicitly designated QA Space when available.
2. Read [setup](references/setup.md) for first use, missing tools or a changed host. Check live capabilities; do not assume every image includes browsers, Playwright, SDKs or the app's dependencies.
3. Record the environment using [environment.example.json](assets/environment.example.json). Replace example values with observations; unknown isolation properties block a claim that the environment is isolated.
4. Verify guest identity, scoped file access and the required browser/GUI tool. Keep an explicit sandbox reference in every call.
5. Stage only the selected build and fixtures, execute meaningful scenarios, and return evidence. Use [QA workflow](references/qa-workflow.md) for recovery, longer runs and cleanup.

When the user asks simply to test an app, handle discovery and routine setup decisions yourself within their authorization. Ask only for a missing target, needed privilege, cost, credential or other boundary that materially changes the work. Installing this skill is not authorization to purchase cloud resources or copy personal sessions.

## Isolation contract

- Use a dedicated guest. Never use the physical desktop, personal browser profile, host clipboard, user input devices or an existing personal app session as a fallback.
- Reject `direct:` or a host desktop as an isolated QA target. A dedicated remote VM is acceptable only after its identity and isolation are established.
- Inspect actual runtime configuration: mounts, privileged mode, host devices/sockets, networking, shared volumes and credentials. No host home, Docker socket, personal cookie store or broad credential mounts.
- A normal container shares its host kernel. Use a VM or stronger runtime when the workload's threat model requires it. A skill is guidance, not an OS security boundary.
- Keep permissions explicit. Cua's `--sandbox` is a default, not a target allowlist; tool calls can override it. Pin the target in every operation and use service-side scoped access or a dedicated runtime/account if hard enforcement is required.
- Use one controller per shared GUI desktop. Establish a lease/lock in the project's existing coordination system before input; uncertain ownership means stop. Parallel browsers need separate profiles and resources even when headless.
- Do not teleport personal applications, reuse logged-in browser sessions or grant shared-volume access merely to make a test pass. Use synthetic data or approved test identities.
- Do not loosen network or approval policies to bypass a blocker. State what is missing and the narrow next action.

## Choose the test route

| Application | Route |
| --- | --- |
| Web | Run the app and Playwright/browser inside the guest, with a fresh context/profile. |
| Linux desktop or Electron | Use the guest's Cua computer tools; observe, act, then verify a fresh screenshot. |
| API/CLI/backend | Run the project's tests inside a compatible guest; preserve exit codes and logs. |
| Native macOS | A compatible macOS VM/Space, with required tooling and licensing; Linux does not validate it. |
| Windows / Android / iOS | Require the actual compatible guest, emulator/device and SDK route. Report blocked if unavailable. |

A browser rendered on Linux can validate web behavior, not native macOS/iOS behavior.

## Before reporting ready

Prove the selected target is live, the app artifact matches the recorded hash/commit, dependencies are available, and evidence can be recovered. For a web smoke test, stage and run [smoke.cjs](scripts/smoke.cjs) inside the guest as described in setup. It exercises a synthetic browser fixture; it is not the application's acceptance suite.

## Completion

Return: target/build, scenarios, expected versus observed results, defects with reproduction steps, evidence paths, blocked checks, and resources stopped or intentionally retained. Use [result.example.json](assets/result.example.json) if a machine-readable report helps. Never mark unexecuted checks as passed.

A persistent Space does not keep the agent running automatically. Before unattended work, establish a real persistent executor, a deadline, budgets, checkpoint storage and recovery ownership. See the long-run section in the QA workflow.
