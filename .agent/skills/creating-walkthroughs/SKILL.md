---
name: creating-walkthroughs
description: Generates walkthrough documents for the user detailing what was implemented and identifying any manual actions the user needs to complete. Use when the user asks for a summary of changes, a walkthrough, or instructions on what to do next.
---

# Creating Walkthroughs

## When to use this skill
- User asks for a summary or walkthrough of the completed work.
- User needs instructions on manual steps they must perform after an implementation.
- User wants a clear handoff document after a task is finished.

## Workflow
1. Review the recent changes, implementations, and any configurations added during the session.
2. Identify what parts of the task are fully completed and what parts require manual user intervention (e.g., setting environment variables, running a specific local command, creating a database, or logging into a third-party service).
3. Draft a clear, structured `walkthrough.md` document or provide the response directly to the user.
4. Ensure the document is formatted with clear headings, lists for manual steps, and code blocks for any commands the user needs to run.

## Instructions

When generating a walkthrough, adhere to the following structure:

### 1. What Was Done
Provide a concise, high-level summary of the accomplishments. Avoid overly technical jargon unless necessary.
- List the main features or fixes implemented.
- Mention key files created or modified.
- Highlight any important design or architectural decisions made.

### 2. What You Need to Do (Manual Steps)
Provide explicit, step-by-step instructions for anything the user must do themselves.
- **Environment Setup:** Any API keys, secrets, or `.env` modifications required.
- **Commands:** The exact commands (e.g., `npm install`, `python manage.py migrate`) they need to run, using code blocks.
- **Third-Party Services:** Instructions on accounts to create or dashboards to configure.
- **Verification:** How the user can test that everything is working as expected (e.g., "Navigate to `http://localhost:3000` and confirm the login button is visible").

### 3. Formatting
- Keep the document concise but comprehensive.
- Use bold text to emphasize important warnings or specific file names.
- Use bullet points for readability.

## Resources
*(None currently required for this skill)*
