# Using This Template System

## For First-Time Users

### Step 1: Copy the Template
```bash
# Navigate to where you want your new project
cd ~/projects/

# Copy the TEMPLATE folder
cp -r "/Users/putte/Projects/Project startup/TEMPLATE" ./my-new-project

# Enter your new project
cd my-new-project

# Test that it works
make help
```

### Step 2: Read the Guide
Open these files in order:
1. `TEMPLATE_README.md` — Quick overview
2. `TEMPLATE_GUIDE.md` — Philosophy
3. `WORKFLOW.md` — Full process

### Step 3: Start Your Project
```bash
# Verify environment
make init

# You'll see warnings - that's expected!
# These files don't exist yet - you create them
```

### Step 4: Generate TRD
1. Go to ChatGPT
2. Describe your project
3. Ask for a Technical Requirements Document
4. Download the .md file
5. Save to `.assistant/trd/your-project.md`

### Step 5: Begin Planning
```bash
# This shows you what to do next
make project-start
```

Follow the prompts and create:
- `.assistant/canvas/vision.md`
- `.assistant/canvas/goals.md`
- `.assistant/canvas/stakeholders.md`
- `.assistant/canvas/questions.md`
- `.assistant/plan.md`
- `.assistant/backlog.md`
- `.assistant/status.md`

### Step 6: Verify
```bash
# Check that planning is complete
make planning-checklist

# Should show YES for all items
```

### Step 7: Start Coding
```bash
# Begin your first work session
make session-start

# Work on backlog items...

# End your session
make session-end
```

## Directory Structure After Setup

```
my-new-project/
├── Makefile
├── .vscode/
│   ├── tasks.json
│   ├── keybindings.json
│   └── settings.json
├── .assistant/
│   ├── README.md
│   ├── trd/
│   │   └── your-project.md        ← You create
│   ├── canvas/
│   │   ├── vision.md              ← You create
│   │   ├── goals.md               ← You create
│   │   ├── stakeholders.md        ← You create
│   │   └── questions.md           ← You create
│   ├── plan.md                    ← You create
│   ├── backlog.md                 ← You create
│   ├── status.md                  ← You create
│   ├── history.md                 ← You create
│   ├── task_log.md                ← You create
│   ├── prompts/                   ← Pre-filled
│   ├── examples/                  ← Pre-filled (reference)
│   └── adr/                       ← You create ADRs here
└── [your source code]
```

## What's Included vs What You Create

### Included (Pre-filled)
- ✅ Makefile with all commands
- ✅ .vscode configuration
- ✅ .assistant/prompts/ (AI prompts)
- ✅ .assistant/examples/ (reference files)
- ✅ .assistant/README.md (documentation)

### You Create (Per Project)
- 📝 .assistant/trd/ (your TRD files)
- 📝 .assistant/canvas/ (your vision, goals, etc.)
- 📝 .assistant/plan.md (your roadmap)
- 📝 .assistant/backlog.md (your work items)
- 📝 .assistant/status.md (your project health)
- 📝 .assistant/history.md (your session notes)
- 📝 .assistant/adr/ (your decision records)

## Common Questions

### Q: Do I need all the canvas files?
A: Yes, they clarify context. Skip them and you risk building the wrong thing.

### Q: Can I skip the TRD?
A: No. TRD is your source of truth. Everything traces back to it.

### Q: What if I don't use VS Code?
A: The Makefile works in any terminal. VS Code config is optional but helpful.

### Q: Can I modify the Makefile?
A: Yes! Customize it for your workflow.

### Q: Do I need to fill examples/?
A: No, examples/ is reference only. Look at them but don't edit.

### Q: Where does my actual code go?
A: Anywhere! The .assistant/ folder is planning/tracking. Your src/, lib/, etc. go alongside it.

## Keyboard Shortcuts (Mac)

If you're using VS Code:
- `Cmd+Shift+I` — Initialize project
- `Cmd+Shift+P` — Start planning (conflicts with Command Palette, use tasks instead)
- `Cmd+Shift+K` — Start session
- `Cmd+Shift+E` — End session
- `Cmd+Shift+R` — Quick review
- `Cmd+Shift+H` — Show help

Or just use Command Palette (`Cmd+Shift+P`) and search for the task.

## Make Commands Reference

```bash
# SETUP
make help                   # Show all commands
make init                   # Verify environment
make verify-env             # Check directory structure

# PLANNING
make project-start          # Begin planning phase
make planning               # Planning workflow
make planning-checklist     # Verify planning complete
make requirements-review    # Cross-reference TRD to backlog
make trd                    # List TRD files

# DEVELOPMENT
make session-start          # Start work session
make session-end            # End work session
make review                 # Quick status check

# OPERATIONS
make migration              # Handle migrations/deployment
```

## Tips for Success

1. **Read TRD thoroughly** — Don't skim it
2. **Fill canvas completely** — Don't leave placeholders
3. **Keep backlog items small** — 1-3 days each
4. **Update status often** — After each session
5. **Document decisions** — Create ADRs for major choices
6. **Ask questions early** — Don't assume

## When Things Go Wrong

### "make init fails with warnings"
✅ **Expected!** These files don't exist until you create them:
- .assistant/plan.md
- .assistant/backlog.md
- .assistant/status.md

Just create them as you go through planning.

### "No TRDs found"
You need to generate a TRD in ChatGPT and save to `.assistant/trd/`.

### "Command not found: make"
Install make:
```bash
# On Mac
xcode-select --install
```

### "Tasks don't appear in VS Code"
Reload VS Code:
```bash
Cmd+Shift+P → "Reload Window"
```

## Next Steps

After copying the template:
1. Read `TEMPLATE_README.md` for overview
2. Read `TEMPLATE_GUIDE.md` for philosophy
3. Read `WORKFLOW.md` for full process
4. Follow this `QUICK_START.md` step-by-step

For AI agents, read:
- `AGENT_INSTRUCTIONS.md`
- `AGENT_BEST_PRACTICES.md`
- `AGENT_GUARDRAILS.md`

## Support

This is a self-contained template system. All documentation is included.

For questions about:
- **Template structure:** See `TEMPLATE_GUIDE.md`
- **Workflow:** See `WORKFLOW.md`
- **Setup steps:** See `SETUP_CHECKLIST.md`
- **AI agents:** See `AGENT_*.md` files
