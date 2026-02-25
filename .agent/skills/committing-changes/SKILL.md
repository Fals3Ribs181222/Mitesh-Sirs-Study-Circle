---
name: committing-changes
description: Automates the process of staging and committing code to a local repository. Use when the user asks to commit changes, save work, or track file modifications using Git.
---

# Committing Changes

## When to use this skill
- User says "commit my code", "save my changes", or "stage and commit".
- User wants to record the current state of their project in version control, but does not explicitly ask to push.

## Workflow

1.  **Status Check**: Run `git status` to identify modified, added, or deleted files.
2.  **Stage Changes**: Add relevant files using `git add .` or specify individual file paths if the user requests a partial commit.
3.  **Commit**: Create a commit with a clear, standard commit message using `git commit -m "[message]"`.

## Instructions

### 1. Commit Messages
Follow standard conventional commit messages if the user doesn't provide a specific one:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Formatting changes, missing semi colons, etc.
- `refactor`: Refactoring production code
- `perf`: Performance improvements
- `test`: Adding missing tests or correcting existing tests
- `chore`: Updating tasks, packages, etc; no production code change

### 2. Common Commands

#### Stage all files
```powershell
git add -A
```

#### Commit code
```powershell
git commit -m "feat: user-provided description"
```

### 3. Using the Helper Script
You can use the provided script to stage all changes and commit in one go. Give an appropriate descriptive commit message.
```powershell
./.agent/skills/committing-changes/scripts/commit.ps1 -Message "fix: resolve login bug"
```

## Error Handling
- **No changes to commit**: If `git status` shows the working tree is clean (or if the script fails with exit code 1 due to no changes), inform the user there's nothing to commit.
- **Unmerged paths**: If there are unresolved merge conflicts, instruct the user to resolve them before committing.
- **Identity unknown**: If Git prompts for email and name, tell the user to run `git config --global user.email "you@example.com"` and `git config --global user.name "Your Name"`.
