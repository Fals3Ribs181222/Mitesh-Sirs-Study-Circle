import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!;
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
const GOOGLE_REFRESH_TOKEN = Deno.env.get('GOOGLE_REFRESH_TOKEN')!;
const DRIVE_FOLDER_ID = Deno.env.get('DRIVE_FOLDER_ID')!;
const DRIVE_WATCH_TOKEN = Deno.env.get('DRIVE_WATCH_TOKEN')!;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function getAccessToken(): Promise<string> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            refresh_token: GOOGLE_REFRESH_TOKEN,
            grant_type: 'refresh_token',
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`OAuth token error: ${err}`);
    }
    const json = await res.json();
    return json.access_token as string;
}

async function getCallerRole(authHeader: string | null): Promise<string | null> {
    if (!authHeader) return null;
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error } = await adminClient.auth.getUser(token);
    if (error || !user) return null;
    const { data } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    return data?.role ?? null;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const authHeader = req.headers.get('Authorization');
    const callerRole = await getCallerRole(authHeader);

    if (callerRole !== 'teacher' && callerRole !== 'admin') {
        return new Response(JSON.stringify({ error: 'Unauthorised' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    try {
        const accessToken = await getAccessToken();

        // Drive push notifications expire after 7 days max
        const expiration = Date.now() + 7 * 24 * 60 * 60 * 1000;

        // Unique channel ID for this watch registration
        const channelId = crypto.randomUUID();

        // Webhook URL = the drive-to-youtube function
        const webhookUrl = `${SUPABASE_URL}/functions/v1/drive-to-youtube`;

        const watchRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${DRIVE_FOLDER_ID}/watch`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: channelId,
                    type: 'web_hook',
                    address: webhookUrl,
                    token: DRIVE_WATCH_TOKEN,
                    expiration: expiration.toString(),
                }),
            }
        );

        if (!watchRes.ok) {
            const err = await watchRes.text();
            throw new Error(`Drive watch registration failed: ${err}`);
        }

        const watchJson = await watchRes.json();
        const expiresAt = new Date(Number(watchJson.expiration)).toISOString();

        return new Response(
            JSON.stringify({ success: true, channelId, expiresAt }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (err) {
        console.error('setup-drive-watch error:', err);
        return new Response(
            JSON.stringify({ error: (err as Error).message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
