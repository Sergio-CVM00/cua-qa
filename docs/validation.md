# Validation record

Date: 2026-10-15. This record separates package checks, a live synthetic browser test and untested routes.

## Verified

- Skill Creator frontmatter/package validator passed.
- Node syntax check passed for `scripts/smoke.cjs`.
- Vercel `skills add` installed the local package into temporary project-scoped Claude Code and Codex directories.
- The browser fixture ran inside an existing dedicated Cua Linux ARM64 guest, through explicit `cua sandbox exec` and `cp` calls.
- Controller CLI: Cua 0.4.1. Guest runtime: runc container; Playwright Core 1.64.0; Chromium 154.0.8037.92.
- Runtime inspection showed zero mounts, privileged=false, no added capabilities and bridge networking. This is a bounded configuration observation, not a sandbox-escape audit or an assertion of offline networking.
- The headless test used a fresh browser context, with Chromium sandboxing enabled. It loaded the fixture, added a task using browser input, rejected empty input and observed no browser console/page errors.
- [Machine-readable smoke result](smoke-result.json) and [browser screenshot](smoke-browser.png) were copied out and inspected.
- A missing Playwright module produced exit code 1 and a failed result with an actionable dependency message.
- Browser and fixture server closed after the run; a process check found no remaining smoke/browser processes.
- The physical desktop, personal browser, mouse and keyboard were not used.

The controller reused its existing isolated QA runtime. The package itself was authored and installation-tested on a separate Linux development host.

## Limits

- This was a short synthetic test, not an independent agent benchmark or a real application's full acceptance suite.
- The installed package was checked for both agent directory layouts; fresh Claude Code and Codex inference sessions were not run.
- The MCP configuration follows the official documentation and installed CLI help; this validation exercised CLI transport, not a fresh MCP client connection.
- Fresh Cua/runtime provisioning was not tested. The existing guest's image digest was unavailable through its Cua metadata, so exact image recreation was not demonstrated.
- Native macOS, Windows, Android/iOS, cloud billing/leases and multi-hour unattended operation were not exercised.
- Linux GUI/Electron input was not part of this headless browser test.
- Cua's target default does not enforce a target allowlist. No claim of whole-agent containment is made.

Use the setup record and the app's own acceptance tests in each new environment.
