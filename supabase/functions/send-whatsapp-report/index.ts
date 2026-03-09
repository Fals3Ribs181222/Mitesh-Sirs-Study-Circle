import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!;
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!;
const TWILIO_WHATSAPP_FROM = Deno.env.get('TWILIO_WHATSAPP_FROM')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function sendWhatsApp(to: string, message: string) {
  const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

  const body = new URLSearchParams({
    From: TWILIO_WHATSAPP_FROM,
    To: `whatsapp:+91${to}`,
    Body: message
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Twilio error: ${err.message}`);
  }

  return response.json();
}

serve(async (req: Request) => {
  // Handle CORS preflight
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
    const body = await req.json();
    const { phone, report } = body;

    if (!phone || !report) {
      return new Response(JSON.stringify({ error: 'Missing phone number or report content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Add a formal header
    const formattedMessage = `✨ *Student Progress Report*\n\n${report}\n\n— Mitesh Sir via TuteFlow`;

    await sendWhatsApp(phone, formattedMessage);

    return new Response(
      JSON.stringify({ success: true, sent_to: phone }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (err) {
    console.error('WhatsApp dispatch error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed to dispatch message' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
