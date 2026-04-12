# Instructions

This folder contains step-by-step instructions for branch work. Each file in `branches/` is a self-contained task spec that a teammate can give to their Claude Code instance to execute.

## How to use

1. Check which branch you're assigned to
2. Read `global-rules.md` first — these apply to ALL branches
3. Open the branch file in `branches/` (e.g. `feat-discovery-profile.md`)
4. In Claude Code, paste this prompt:

```
Read the file instructions/global-rules.md and instructions/branches/<your-branch-file>.md, then follow every step in order. Ask me before making any decision not covered in the instructions.
```

5. Let Claude execute step by step. Review each commit before pushing.

## Folder structure

```
instructions/
├── README.md           ← you are here
├── global-rules.md     ← rules everyone follows
└── branches/
    └── feat-*.md       ← one file per branch task
```
