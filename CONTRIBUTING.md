# Contributing to LMS Bootcamp Project

## Before You Start

1. Always work on a feature branch, never directly on `main`
2. One feature/fix per branch

## Workflow

### Starting New Work

```bash
git checkout main
git pull origin main
git checkout your-branch-name
```

### Making Changes

```bash
git add .
git commit -m "Clear description of changes"
```

### Before Creating a PR (IMPORTANT)

```bash
git checkout main
git pull origin main
git checkout your-branch-name
git merge main
# Resolve any conflicts locally, then:
git push origin your-branch-name
```

### Creating Pull Request

- Create PR on GitHub from your branch to `main`
- Add clear description of changes
- Assign PR to a reviewer e.g its-jedu

## Branch Naming Convention

- `frontend/short-description` (e.g., `frontend/add-login-page`)
- `backend/short-description` (e.g., `backend/setup-database`)

## Important Rules

- Never force push to `main`
- Always pull latest `main` before creating PR
- Resolve merge conflicts locally, not on GitHub
- Don't delete files you didn't create
