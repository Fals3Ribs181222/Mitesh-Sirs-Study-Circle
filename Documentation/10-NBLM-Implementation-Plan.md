# NotebookLM Integration Architecture Plan

## Goal Description
Integrate NotebookLM's AI generation capabilities (Flashcards, Quizzes, Audio Overviews) into the "Mitesh Sir's Group Tuitions" web application, which currently utilizes a serverless architecture (Frontend JS + Supabase).

## The Challenge
The current application runs entirely in the user's browser (HTML/JS) and communicates directly with Supabase. 
The NotebookLM MCP (Model Context Protocol) requires a secure server environment to run the MCP client and authenticate with Google. You **cannot** run the MCP client directly in the browser because:
1. It exposes your NotebookLM credentials to everyone.
2. The MCP protocol requires server-side network capabilities.

## Proposed Architectural Solutions

### Option 1: Supabase Edge Functions (Recommended)
Since you are already using Supabase, the most native way to add a "Backend" is to use **Supabase Edge Functions** (written in Deno/TypeScript).

**How it works:**
1. A student clicks "Generate Flashcards" on `student_dashboard.html`.
2. A request is sent to a newly created Supabase Edge Function (e.g., `generate-study-materials`).
3. The Edge Function securely holds your NotebookLM credentials. Inside the Edge Function, we run the MCP Client.
4. The Edge Function talks to NotebookLM, creates the flashcards, stores the result in a new Supabase table (e.g., `generated_materials`), and returns them to the frontend.

**Pros:** Keeps everything within the Supabase ecosystem. Secure. Highly scalable.
**Cons:** Requires writing TypeScript/Deno code and setting up the Supabase CLI.

### Option 2: Pre-generation Agent (No Backend Changes)
Instead of dynamic generation by the user, we use me (the AI Assistant) as an automated script.

**How it works:**
1. When a teacher uploads a new PDF to the `materials` bucket via `upload.html`, you ask me (or we write a local script) to read that file.
2. I use the NotebookLM MCP tools *here in this chat* to generate Flashcards and an Audio Podcast.
3. I then write those generated flashcards into a new JSON file, upload the Audio file to your Supabase `materials` bucket, and update your PostgreSQL database or HTML to link to them.
4. The Frontend simply reads the pre-generated static files.

**Pros:** Zero backend architecture changes required. Immediate results.
**Cons:** Not dynamic. A human (or agent) has to manually trigger the generation step whenever new materials are added.

### Option 3: Separate Node.js Backend Server
We spin up a completely separate Node.js (Express) server hosted on Render or Heroku.

**How it works:**
Your frontend JS makes API calls to this new Node server, which handles the NotebookLM MCP logic.

**Pros:** Standard approach to MCP integration. Very flexible.
**Cons:** Introduces a completely new hosting environment and infrastructure outside of Supabase.
