# Razorpay production connection

Your website already has Razorpay UI and a checkout hook. On Monday, after your bank account is ready:

1. Create / activate Razorpay merchant account.
2. Complete KYC and add bank account.
3. From Razorpay Dashboard, copy `Key ID`.
4. Put Key ID in `config.js` as `RAZORPAY_KEY_ID`.
5. For true production security, create a Supabase Edge Function that creates Razorpay Orders server-side and verifies the payment/webhook secret. Razorpay's docs recommend Standard Checkout integration, Orders API, and webhooks for reliable payment confirmation.

Current frontend behavior:
- If Razorpay key is missing, it runs demo success.
- If Razorpay key is added, Razorpay checkout opens.
- Order is saved to Supabase after successful payment handler.

Production next step:
- Add server-side order creation + webhook verification before marking orders paid.
