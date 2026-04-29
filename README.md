# Harvester Parts v10 — Pro Marketplace Drop-in ZIP

Upload/replace these files in your GitHub repo. Do not delete your repo; just overwrite matching files and add the new files.

## Added in v10
- Floating AI assistant for product suggestions, seller help and plan guidance
- Voice search for marketplace filters using browser speech recognition
- Razorpay-ready seller plan payment flow
- AI price guidance on product detail pages
- PWA support: installable mobile-app style experience with service worker
- Smoother page transitions and scroll reveal animations
- Extra Supabase SQL tables for images, notifications, saved products, payment events and AI logs

## Setup
1. Edit `supabase-config.js` and add your Supabase URL + anon key.
2. Run `supabase-schema.sql` in Supabase SQL Editor. It drops/recreates base tables first, then adds v10 tables.
3. Create these Supabase Storage buckets: `product-images`, `seller-documents`.
4. For payments, replace `rzp_test_REPLACE_WITH_YOUR_KEY_ID` inside `pro-features.js` with your Razorpay key ID.

## Important payment note
Client-only Razorpay works for demo/testing. For real money, create Razorpay orders and verify signatures on a secure backend/serverless function before activating plans.

## Mobile app note
This ZIP makes the site installable as a PWA. A full native React Native app is a separate project, but this is ready for mobile users now.
