# MCP Playbook

MCP (Model Context Protocol) servers extend what AI agents can do — giving them tools to
browse the web, query databases, manage GitHub, run tests, and more.

Config file: `.mcp.json` at project root (auto-loaded by Claude Code).
Env vars: set in your shell or a `.env` file (never commit secrets).

---

## Available Servers

### filesystem
Read and write files/directories outside the current working directory.

```json
"filesystem": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/project"]
}
```

**Use when:** The codebase is large, split across directories, or you want the agent to
navigate file trees without manual file reads.

---

### github
Create and read issues, pull requests, comments, labels, and reviews.

```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}" }
}
```

**Use when:** You want the agent to create issues from open questions, link PRs to
backlog items, or post status updates as comments on issues.

**Setup:** Create a token at github.com/settings/tokens with `repo` scope.

---

### fetch
Fetch web pages and APIs — converts HTML to markdown for the agent.

```json
"fetch": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-fetch"]
}
```

**Use when:** The agent needs to read documentation, check an API spec, or research
a library before recommending it in an ADR.

---

### memory
Persist key-value data across sessions — survives conversation resets.

```json
"memory": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-memory"]
}
```

**Use when:** You want the agent to remember project-specific context (tech stack,
team conventions, recurring decisions) without re-reading all canvas files each session.

---

### playwright
Browser automation — navigate pages, click elements, capture screenshots, run E2E tests.

```json
"playwright": {
  "command": "npx",
  "args": ["-y", "@playwright/mcp"]
}
```

**Use when:** Acceptance criteria include UI behaviour, or you want the agent to
verify a feature works end-to-end before marking a backlog item Done.

---

### postgres
Query a PostgreSQL database — read schema, run SELECT queries, inspect data.

```json
"postgres": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres"],
  "env": { "DATABASE_URL": "${DATABASE_URL}" }
}
```

**Use when:** Writing or reviewing database migrations, exploring schema, or
validating that a feature stored data correctly.

---

## Workflow Integration

### Session start
```
1. List available MCP tools
2. Map tools to today's backlog items:
   - Working on a GitHub issue? → use github MCP
   - Writing a migration? → use postgres MCP
   - Verifying UI? → use playwright MCP
3. Plan steps using relevant tools, then execute
```

### Logging MCP actions
Every MCP tool call should be logged in `task_log.md`:

```markdown
- Tool: github / create_issue
  Args: title="AUTH-001: Email signup", labels=["auth", "now"]
  Result: Issue #42 created
  Link: https://github.com/org/repo/issues/42
```

### Linking artifacts
After an MCP action produces an artifact (issue, PR, screenshot, query result),
link it in `status.md` under **Artifacts**:

```markdown
- GitHub issue #42: AUTH-001 Email signup
- PR #17: Implements NOTE-003 pagination
```

---

## Enabling / Disabling Servers

Edit `.mcp.json` at the project root. Remove or comment out servers you don't need.
Env vars starting with `${}` must be set before running — add them to your shell profile
or a `.env` file (which is gitignored).

```sh
# .env (gitignored — never commit)
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
```

---

## Finding More Servers

- Official servers: github.com/modelcontextprotocol/servers
- Community registry: mcp.so
