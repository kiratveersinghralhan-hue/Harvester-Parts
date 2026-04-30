# Harvester Parts — Fresh Complete Marketplace

Ready-to-publish flat frontend. Upload all files to your GitHub repo root. No build step required.

## What to edit
Open `config.js` and add:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `RAZORPAY_KEY_ID`
- `WHATSAPP_NUMBER`

Never add Supabase service role key to frontend.

## Supabase
Run `supabase-schema.sql` in Supabase SQL Editor. Enable:
- Auth: email + phone OTP
- Storage bucket: `product-images`
- Realtime for `chat_messages`

## Included
- Amazon-style marketplace and cart
- OLX-style enquiry + WhatsApp + chat UI
- Product carousel and product detail pages
- Seller verification forms
- Machine selector
- Admin dashboard mock/structure
- Plans ₹999–₹15,999
- Rewards and custom badges
- AI assistant UI
- Language popup with Indian and global languages
- PWA files

This is frontend-complete with Supabase/Razorpay hooks. Payment verification should be secured with a backend/edge function before taking real money.

## vNext Full Systems Upgrade
SQL required: YES. Run `supabase-update-full-systems.sql` once in Supabase SQL Editor.

What this upgrade adds:
- Account profile page with photo upload preview
- Admin panel access protection
- Seller dashboard and local listing management
- Seller verification form
- Cart quantity/remove + checkout
- Razorpay-ready checkout flow
- Buyer/seller chat demo with Supabase-ready SQL tables
- Reviews, reports, orders, reward events and seller plans tables

After SQL:
1. Create Storage buckets: `product-images`, `profile-images`, `verification-docs`.
2. Keep `product-images` and `profile-images` public. Keep `verification-docs` private.
3. To make yourself admin:
```sql
update public.users set role = 'Admin' where email = 'YOUR_EMAIL_HERE';
```
