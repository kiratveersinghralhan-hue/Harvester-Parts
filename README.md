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

## vCheckout update
- Added full frontend checkout flow: cart review, quantity controls, delivery details, payment mode, order summary, Razorpay-ready payment, and local demo order confirmation.
- SQL required: No. This update only changes frontend files and localStorage demo order behavior.
