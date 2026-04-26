# Project Startup Template

This is a ready-to-copy template for starting new Vibe coding projects with TRD-driven planning.

> 📝 **Note:** This README is copied to your project. You should replace it with your own project-specific README once you understand the workflow. Keep this file as reference during initial setup, then create your own README describing your application.

---

## How to Use This Template

### Option 1: Copy to New Project
```bash
# Copy entire TEMPLATE folder to your new project
cp -r TEMPLATE/* /path/to/your/new/project/
cd /path/to/your/new/project/

# Verify structure
make help
```

### Option 2: Initialize in Existing Project
```bash
# Copy just the pieces you need
cp -r TEMPLATE/.assistant /path/to/existing/project/
cp -r TEMPLATE/.vscode /path/to/existing/project/
cp TEMPLATE/Makefile /path/to/existing/project/

# Test
cd /path/to/existing/project/
make init
```

## What Gets Copied

```
TEMPLATE/
├── Makefile                 # All automation commands
├── .vscode/
│   ├── tasks.json          # VS Code tasks
│   ├── keybindings.json    # Mac-friendly shortcuts
│   └── settings.json       # Workflow documentation
└── .assistant/
    ├── README.md           # Workspace guide
    ├── prompts/            # AI prompts for each phase
    ├── trd/                # TRD storage (empty, you fill)
    ├── canvas/             # Context files (vision, goals, etc.)
    ├── examples/           # Example files showing proper format
    │   ├── plan.md
    │   ├── backlog.md
    │   ├── status.md
    │   └── adr/            # Example ADRs
    └── adr/                # Your ADRs go here (empty)
```

## Quick Start After Copying

1. **Generate TRD in ChatGPT**
   - Save to `.assistant/trd/your-feature.md`

2. **Run initialization**
   ```bash
   make init
   ```

3. **Fill canvas files**
   - `.assistant/canvas/vision.md`
   - `.assistant/canvas/goals.md`
   - `.assistant/canvas/stakeholders.md`
   - `.assistant/canvas/questions.md`

4. **Start planning**
   ```bash
   make project-start
   ```

5. **Create plan and backlog**
   - `.assistant/plan.md` (Now/Next/Later)
   - `.assistant/backlog.md` (Granular tasks)

6. **Verify**
   ```bash
   make planning-checklist
   ```

7. **Start coding**
   ```bash
   make session-start
   ```

## Files You Create (Not in Template)

These files you create per project:
- `.assistant/plan.md` — Your project roadmap
- `.assistant/backlog.md` — Your work items
- `.assistant/status.md` — Your project health
- `.assistant/history.md` — Your session notes
- `.assistant/task_log.md` — Your completed tasks
- `.assistant/trd/*.md` — Your TRD files

## Documentation

See the parent directory for full documentation:
- `../TEMPLATE_GUIDE.md` — Philosophy and structure
- `../WORKFLOW.md` — Full workflow diagrams
- `../SETUP_CHECKLIST.md` — Step-by-step onboarding
- `../AGENT_INSTRUCTIONS.md` — For AI agents
- `../AGENT_BEST_PRACTICES.md` — Agent patterns
- `../AGENT_GUARDRAILS.md` — What agents must not do

## Available Commands

```bash
make help                   # Show all commands
make init                   # Verify environment
make project-start          # Initialize planning
make session-start          # Begin work session
make session-end            # End work session
make review                 # Quick status check
make planning-checklist     # Verify planning complete
make trd                    # List TRD files
```

## What This Template Provides

✅ **Structured workflow** — TRD → Canvas → Plan → Backlog → Status  
✅ **AI agent guidance** — Instructions, best practices, guardrails  
✅ **Example files** — See what good output looks like  
✅ **Automation** — Make commands for every phase  
✅ **VS Code integration** — Tasks and keybindings ready  
✅ **Documentation** — Self-documenting workspace  

## Customizing the Template

Feel free to modify:
- `Makefile` — Add/remove commands
- `.vscode/tasks.json` — Adjust tasks
- `.assistant/prompts/` — Customize prompts
- Canvas structure — Add/remove files

Keep:
- Directory structure (tools expect these paths)
- TRD storage location (`.assistant/trd/`)
- Example files (reference for agents)

## Support

For questions about this template, see:
- `.assistant/README.md` — Workspace documentation
- `.assistant/examples/` — Working examples
- Parent directory documentation files
