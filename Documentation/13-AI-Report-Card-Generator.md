# AI Report Card Generator

The system includes an AI-powered progress report generator integrated into the Teacher Dashboard's Student Detail view. It uses the Anthropic API (Claude) to produce parent-friendly written summaries of a student's academic and attendance performance.

## Architecture

The feature follows a secure, serverless pipeline to ensure the Anthropic API key is never exposed to the browser.

1. **Teacher opens a Student Detail view** — The dashboard fetches the student's batches, attendance stats, and test marks as normal.
2. **Data is accumulated client-side** — As each section loads, `js/dashboard/students.js` quietly stores the data in a `studentReportData` object.
3. **Teacher clicks "✨ Generate Report"** — The button becomes enabled only once all data has finished loading, preventing incomplete reports.
4. **Frontend calls the Edge Function** — `students.js` sends the accumulated data as JSON to the `generate-report` Supabase Edge Function, authenticated with the teacher's Supabase session token.
5. **Edge Function calls Anthropic** — The function builds a structured prompt from the student data and calls `claude-haiku-4-5` via the Anthropic API. The API key is stored securely as a Supabase secret and is never sent to the browser.
6. **Report is returned and displayed** — The generated text is rendered in the report card section of the student detail view, with a **Copy to Clipboard** button for easy sharing with parents.

## Key Files

| File | Purpose |
|---|---|
| `supabase/functions/generate-report/index.ts` | Edge Function (Deno) — builds the prompt and calls the Anthropic API |
| `js/dashboard/students.js` | Accumulates student data and calls the Edge Function on button click |
| `components/tabs/students.html` | Student detail UI — includes the AI Report section with Generate and Copy buttons |

## Edge Function

The Edge Function (`supabase/functions/generate-report/index.ts`) accepts a `POST` request with the following JSON body:

```json
{
    "student": {
        "name": "Student Name",
        "grade": "12th",
        "subjects": "Accounts, Commerce"
    },
    "attendance": {
        "total": 40,
        "present": 35,
        "absent": 3,
        "late": 2,
        "rate": 92
    },
    "batches": [
        { "name": "Batch A", "subject": "Accounts", "grade": "12th", "schedule": "Mon/Wed" }
    ],
    "marks": [
        { "title": "Unit Test 1", "subject": "Accounts", "marks_obtained": 38, "max_marks": 50, "date": "2026-01-15" }
    ]
}
```

It returns:

```json
{
    "report": "We are pleased to share the progress report for..."
}
```

## Prompt Design

The prompt instructs Claude to:
- Write **3–4 short paragraphs** in flowing plain English (no markdown or bullet points)
- Address the report **to the parents** (e.g. "We are pleased to share...")
- Cover **attendance behaviour**, **academic performance with specific numbers**, and a **brief recommendation or encouragement**
- Stay **under 200 words**
- Maintain a **professional, warm, and honest** tone appropriate for an Indian tuition centre context

## Environment Secrets

The Anthropic API key is stored as a Supabase Edge Function secret and is never present in the frontend codebase.

| Secret | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key (`sk-ant-...`) from console.anthropic.com |

## Model

The integration uses **`claude-haiku-4-5-20251001`** — Anthropic's fastest and most cost-efficient model. It is well-suited for structured writing tasks like this and keeps per-report costs at a fraction of a cent.

## Deployment

To deploy or redeploy the Edge Function after making changes:

```bash
.\supabase.exe login
.\supabase.exe link --project-ref tksruuqtzxflgglnljef
.\supabase.exe secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here
.\supabase.exe functions deploy generate-report --no-verify-jwt
```

> [!IMPORTANT]
> The `--no-verify-jwt` flag is **required** when deploying this Edge Function. Supabase's API gateway aggressively checks JWTs by default, which can block the raw `fetch` request using `SUPABASE_ANON_KEY` and cause a `401 Unauthorized` error. Bypassing the gateway allows the function to execute and securely call Anthropic.

## UI Behaviour

- The **✨ Generate Report** button is **disabled** when the student detail view first opens and becomes enabled only after all three data sections (batches, attendance, marks) have finished loading.
- While generating, the button shows **"Generating..."** and is disabled to prevent duplicate requests.
- The report output section is hidden until a report is successfully generated.
- A **Copy to Clipboard** button appears alongside the generated report, allowing the teacher to copy and paste the text directly into WhatsApp or any messaging platform to send to parents.
- If the Edge Function returns an error, a human-readable error message is displayed in the report section instead of crashing the UI.
