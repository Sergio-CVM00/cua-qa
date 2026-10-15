# Setup and first run

This is a portable workflow, not a machine-specific installer. Commands below follow the official Cua CLI documentation reviewed on 2026-10-15. Confirm flags with the installed version's help.

## 1. Check prerequisites on the execution host

Run `cua --version`, `cua runtime doctor`, `cua sandbox ls --local --json` and inspect the selected target with `cua sandbox info local:qa-worker --json`.

If Cua is missing, use the [official quickstart](https://cua.ai/docs/cua-cli/quickstart). It documents `npm install -g @trycua/cua` and alternative installers. Installing the skill with `npx skills add` does not install Cua, Docker, a VM, browsers or model credentials. Install a runtime only when authorized; do not run sudo or change host security silently.

Host OS and guest OS are different. Local Linux desktops can run through a compatible container/VM runtime. A native macOS guest requires the supported Apple hardware/Lume route. Use [runtime guidance](https://cua.ai/docs/cua-sdk/guides/local-runtimes), not assumptions based on the controller's OS.

## 2. Reuse or create one dedicated target

Reuse the user's designated QA Space after inspecting ownership and state. Otherwise, for an authorized local Linux workspace:

```sh
cua sandbox create linux --on local --name qa-worker --wait desktop
cua sandbox info local:qa-worker --json
cua sandbox exec local:qa-worker 'id; uname -s; uname -m'
```

The image alias and automatic runtime are convenient discovery defaults, not reproducible pins. Record the resolved image digest, Cua version, runtime/version, architecture, resource limits, network policy and app hash before claiming reproducibility. To recreate it, use the recorded image reference and runtime with the creation flags supported by that version. Preserve the original environment record on rebuild.

Inspect the underlying VM/container configuration as well as Cua metadata. With Docker, inspect only the container ID returned by Cua; capture mount/privilege/device/network fields, not full environment dumps that may contain secrets.

Network access is a deliberate choice. Default outbound access is not offline isolation. Current docs limit `--network none` to local QEMU; do not apply it blindly to containers, Lume or cloud. For an existing offline guest, stage dependencies instead of changing its firewall.

Cloud use requires an account, approved costs, lease and persistence decisions. Do not switch to cloud merely because a local runtime is unavailable.

## 3. Connect the agent

CLI-only agents can execute explicit `cua sandbox ... local:qa-worker` commands without MCP. For MCP, configure a named server using the executable on the machine where the sandbox lives. Do not point a local command at a remote host's localhost.

Example server definition for clients that accept `mcpServers` JSON:

```json
{
  "mcpServers": {
    "cua-qa": {
      "command": "cua",
      "args": ["mcp", "--sandbox", "local:qa-worker", "--permissions", "sandbox:readonly,computer:all"]
    }
  }
}
```

Claude Code:

```sh
claude mcp add cua-qa -- cua mcp --sandbox local:qa-worker --permissions sandbox:readonly,computer:all
```

Codex uses TOML. Add only this named entry to the chosen config, preserving existing settings:

```toml
[mcp_servers.cua-qa]
command = "cua"
args = ["mcp", "--sandbox", "local:qa-worker", "--permissions", "sandbox:readonly,computer:all"]
```

These examples expose shell, file and input access inside the selected guest. Reduce grants for screenshot-only or UI-only work using the [permission reference](https://cua.ai/docs/cua-cli/guides/mcp-server). Omitting permissions grants all tools. Unknown permissions may leave no tools available. The target default is not an access-control boundary.

The official `cua agents setup --agents <id>` can configure supported clients, but inspect its resulting grants and scope. Do not replace a narrower existing server. Reconnect the client and list the actually exposed tools. Verify a guest command and screenshot before input. If a tool schema accepts a sandbox override, pass the approved ref.

Remote controllers should use an authenticated transport to the approved execution host; preserve its runtime context and exact target. Do not copy personal credentials or expose unauthenticated ports.

## 4. Stage and prove a web test

Create a task-owned guest directory. Copy the installed skill's `scripts/smoke.cjs` there with `cua sandbox cp`; never mount the user's home. Example paths below assume a guest working directory already created by this task:

```sh
cua sandbox cp ./scripts/smoke.cjs local:qa-worker:/tmp/cua-qa-smoke/smoke.cjs
cua sandbox exec local:qa-worker 'cd /tmp/cua-qa-smoke && node smoke.cjs ./evidence'
cua sandbox cp local:qa-worker:/tmp/cua-qa-smoke/evidence/result.json ./result.json
cua sandbox cp local:qa-worker:/tmp/cua-qa-smoke/evidence/browser.png ./browser.png
```

Run the script only inside the verified guest. It requires Node.js and `playwright`, or `playwright-core` with `QA_BROWSER_EXECUTABLE` set to the guest browser. With approved guest network access, install a pinned Playwright release and matching browser using the package manager's documented commands. In offline environments, stage the exact package and compatible browser dependencies. Preserve project lockfiles; do not assume the controller's binaries run on the guest.

The script accepts `QA_PLAYWRIGHT_MODULE` for an absolute path to an existing module in the guest. It does not download dependencies, attach to a running browser, disable browser sandboxing or use a personal profile. Missing dependencies fail explicitly. Run it in a new output directory each time.

For real apps, stage the build and run its own scenarios. Guest localhost is the guest, not your development machine. If testing a remote URL, use an explicitly approved reachable URL/test identity. Copy evidence out and verify it before cleaning up.

## Official references

- [Cua CLI quickstart](https://cua.ai/docs/cua-cli/quickstart)
- [Sandbox lifecycle and creation flags](https://cua.ai/docs/cua-cli/reference/cli/sandbox)
- [Sandbox commands and file transfer](https://cua.ai/docs/cua-cli/reference/cli/sandbox-access)
- [MCP permissions and agent configuration](https://cua.ai/docs/cua-cli/guides/mcp-server)
- [Spaces tools](https://cua.ai/docs/spaces/reference)
- [Local runtimes](https://cua.ai/docs/cua-sdk/guides/local-runtimes)
- [Vercel skills CLI](https://skills.sh/docs/cli)
