# Evidence, recovery and longer runs

## A useful QA cycle

1. Write a bounded acceptance list from the actual request. Identify build hash/commit, target, test data, expected results and relevant platform limits.
2. Acquire exclusive GUI ownership when needed. Keep the lease outside a transient browser process and make ownership visible to other controllers. A private directory alone is not a cross-agent lock.
3. Record a baseline and use a fresh browser context/profile. Stage only authorized artifacts, without secrets. Start the app inside the guest; save its command, PID, working directory and log.
4. Exercise realistic actions and assert outcomes. Preserve failed assertions, console errors and relevant network/server failures. A screenshot alone is not functional, accessibility or security certification.
5. Save a screenshot, logs, reproduction steps and expected/actual results for defects. Redact sensitive data before exporting. Publish tracker entries only when authorized; local reporting remains useful without tracker access.
6. If fixes are authorized, make them in the project's normal development environment. Test the changed build in a new run directory, rerun the failing scenario and relevant regression checks, then close defects supported by evidence.
7. Export and read back evidence. Stop only owned app/browser/server processes and release the lease. Retain a designated persistent Space; delete an ephemeral one only under its agreed cleanup authority.

## Before an unattended run

Use an existing supported agent runner, scheduler or persistent session on an execution host that stays awake. A Space, open chat, MCP connection or detached app process is not evidence that an agent will keep testing.

Record:
- Run ID, execution owner, exact target and build.
- Acceptance scenarios and maximum wall time, attempts and spend.
- A checkpoint location outside the disposable process, plus evidence destination.
- Runner/session ID and how to read its status.
- Heartbeat interval, retry limits, cleanup owner and retention policy.
- For cloud, lease duration/renewal owner and cost ceiling; renewing a lease can incur cost.

A reasonable default is a bounded smoke run first. Only start a multi-hour run when its duration and resource use are authorized and the executor is proven. Never invent a cron/job or silently remove model/permission limits.

## Checkpoint and reconnect

After each scenario, write its status and evidence paths atomically, with timestamp, target/build and the next action. Distinguish pending, running, passed, failed and blocked. Persist process IDs and ownership records separately from test success.

On disconnect, reconnect to the same run and inspect the checkpoint, executor and existing resources before resuming. Do not launch duplicates or replay a potentially completed external effect. If the target changed, a lease expired or identity cannot be verified, stop and report blocked.

Stop at the deadline, acceptance completion, unavailable permission/runtime, resource ceiling, or repeated failure without new evidence. Keep the last failure and next action. Do not report an overnight run as validated by a short smoke test.

## Troubleshooting decisions

| Observation | Next action |
| --- | --- |
| Target missing | Recheck execution host/runtime context; do not create a duplicate automatically. |
| Target busy or owner unknown | Wait through the existing coordination mechanism or report blocked. |
| Browser/SDK missing | Install/stage compatible dependencies under existing authority. |
| MCP tool absent | Inspect grants and version; reconnect without expanding to all permissions. |
| Guest cannot reach app | Verify guest URL, binding and approved network route. |
| Shell works but input fails | Verify guest display and Cua Driver readiness; no host-desktop fallback. |
| Native platform mismatch | Select the compatible approved guest or report that route untested. |
| Cloud lease expired | Reconcile resource and data persistence before a new claim. |
