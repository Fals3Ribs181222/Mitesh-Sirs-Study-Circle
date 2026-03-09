// supabase/functions/generate-report/index.ts
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface TestResult {
    title: string;
    subject: string;
    marks_obtained: number;
    max_marks: number;
    date: string;
}

interface BatchInfo {
    name: string;
    subject: string;
    grade: string;
    schedule: string;
}

interface AttendanceStats {
    total: number;
    present: number;
    absent: number;
    late: number;
    rate: number;
}

interface StudentReportRequest {
    student: {
        name: string;
        grade: string;
        subjects: string;
    };
    attendance: AttendanceStats;
    batches: BatchInfo[];
    marks: TestResult[];
}

function buildPrompt(data: StudentReportRequest): string {
    const { student, attendance, batches, marks } = data;

    const attendanceSummary = attendance.total > 0
        ? `Attendance: ${attendance.present} present, ${attendance.absent} absent, ${attendance.late} late out of ${attendance.total} total classes (${attendance.rate}% rate).`
        : 'No attendance records available yet.';

    const batchSummary = batches.length > 0
        ? batches.map(b => `${b.name} (${b.subject}, ${b.grade})`).join('; ')
        : 'Not enrolled in any batches.';

    let marksSummary = 'No test results recorded yet.';
    if (marks.length > 0) {
        marksSummary = marks.map(m => {
            const pct = m.max_marks > 0 ? Math.round((m.marks_obtained / m.max_marks) * 100) : 0;
            return `${m.title} (${m.subject}): ${m.marks_obtained}/${m.max_marks} = ${pct}% [${m.date}]`;
        }).join('\n        ');

        const totalPct = marks.reduce((sum, m) => {
            return sum + (m.max_marks > 0 ? (m.marks_obtained / m.max_marks) * 100 : 0);
        }, 0);
        const avgPct = Math.round(totalPct / marks.length);
        marksSummary += `\n        Overall average: ${avgPct}%`;
    }

    return `You are writing a concise progress report for a student at a private tuition centre in India.
The report will be shared with parents by the teacher, Mitesh Sir.

STUDENT DATA:
- Name: ${student.name}
- Grade: ${student.grade}
- Subjects: ${student.subjects || 'Not specified'}
- Batches enrolled: ${batchSummary}
- ${attendanceSummary}
- Test results:
        ${marksSummary}

Write a professional, warm, and honest progress report of 3-4 short paragraphs.
Cover: attendance behaviour, academic performance with specific numbers, and a brief overall recommendation or encouragement.
Address the report TO the parents (e.g. "We are pleased to share...").
Use plain English - no markdown, no bullet points, no headers. Just flowing paragraphs.
Keep the total length under 200 words.`;
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    try {
        const body: StudentReportRequest = await req.json();

        if (!body.student?.name) {
            return new Response(JSON.stringify({ error: 'Missing student data' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const prompt = buildPrompt(body);

        const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 400,
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!anthropicResponse.ok) {
            const errText = await anthropicResponse.text();
            console.error('Anthropic API error:', errText);
            return new Response(JSON.stringify({ error: 'AI service error. Please try again.' }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const aiData = await anthropicResponse.json();
        const reportText = aiData.content?.[0]?.text ?? '';

        return new Response(JSON.stringify({ report: reportText }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (err) {
        console.error('Edge Function error:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});