// Optional Supabase Edge Function for secure Razorpay verification.
// Deploy separately in Supabase Edge Functions, then add its URL to config.js PAYMENT_VERIFY_URL.
// Requires env: RAZORPAY_KEY_SECRET
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";
const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    const secret = Deno.env.get('RAZORPAY_KEY_SECRET') || '';
    const data = new TextEncoder().encode(`${razorpay_order_id}|${razorpay_payment_id}`);
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, data);
    const hex = Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,'0')).join('');
    return new Response(JSON.stringify({ verified: hex === razorpay_signature }), { headers: { ...cors, 'Content-Type':'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ verified:false, error:String(e) }), { status:400, headers: { ...cors, 'Content-Type':'application/json' } });
  }
});
