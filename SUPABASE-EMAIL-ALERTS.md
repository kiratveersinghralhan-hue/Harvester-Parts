# Supabase Email Alerts

The website is wired to call the `admin-alert` Supabase Edge Function for important events:

- seller verification submitted
- assisted listing request
- new product listing
- new order
- payout request
- membership purchase
- product report
- support request
- buyer message

The alert receiver is configured in `supabase-config.js`:

```js
ADMIN_ALERT_EMAIL: "kiratveersinghralhan@gmail.com",
ADMIN_ALERT_WEBHOOK: "https://rpsiddurmwtwvpnwzclo.supabase.co/functions/v1/admin-alert"
```

## Edge Function Example

Create a Supabase Edge Function named `admin-alert` and use this code:

```ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function esc(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c] || c));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const notice = await req.json();
    const apiKey = Deno.env.get("RESEND_API_KEY");
    const to = Deno.env.get("ADMIN_ALERT_EMAIL") || notice.email_to || "kiratveersinghralhan@gmail.com";
    const from = Deno.env.get("ALERT_FROM_EMAIL") || "Harvester Parts <alerts@harvesterparts.in>";

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY is missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subject = `[Important] ${notice.subject || "Harvester Parts alert"}`;
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#142219">
        <h2>${esc(notice.subject || "Harvester Parts alert")}</h2>
        <p>${esc(notice.body || "")}</p>
        <p><b>Type:</b> ${esc(notice.type || "")}</p>
        <p><b>Time:</b> ${esc(notice.created_at || new Date().toISOString())}</p>
        <pre style="white-space:pre-wrap;background:#f3f7f4;padding:12px;border-radius:10px">${esc(JSON.stringify(notice.payload || {}, null, 2))}</pre>
      </div>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    const result = await emailRes.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok: emailRes.ok, result }), {
      status: emailRes.ok ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error?.message || error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

## Required Supabase Secrets

Set these secrets in Supabase:

```bash
supabase secrets set RESEND_API_KEY=your_resend_key
supabase secrets set ADMIN_ALERT_EMAIL=kiratveersinghralhan@gmail.com
supabase secrets set ALERT_FROM_EMAIL="Harvester Parts <alerts@harvesterparts.in>"
```

Deploy:

```bash
supabase functions deploy admin-alert
```

After this, important website actions will also create rows in `admin_notifications` and mark whether the email function accepted the alert.
