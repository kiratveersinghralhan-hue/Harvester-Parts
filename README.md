# Harvester Parts — Production v19

GitHub-ready one-folder website. No fake catalog: marketplace shows live approved products from Supabase only.

## Setup
1. Upload all files to your GitHub Pages repo.
2. Edit `config.js` and add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `RAZORPAY_KEY_ID`
   - `ADMIN_EMAIL`
3. Run `final-production.sql` once in Supabase SQL Editor.
4. Create/login with your admin email, then run:
   `update public.users set role='admin' where email='YOUR_EMAIL@example.com';`

## SQL required
Yes. Run `final-production.sql` once. It is a clean production setup and resets public marketplace tables.

## Included systems
- Auth + user profiles
- Admin-only panel
- Seller verification approval
- Product approval workflow
- Live marketplace, no fake catalog
- Seller dashboard
- Cart + checkout
- Razorpay frontend payment callback
- Optional Razorpay secure Edge Function sample
- Orders
- Reviews
- Reports / safety
- Messages + realtime notifications
- Rewards / badges page
- Dealer storefront page
- PWA/SEO basics

## Optional secure Razorpay verification
Frontend-only websites cannot safely store Razorpay secret keys. For production-level verification, deploy `razorpay-edge-function.js` as a Supabase Edge Function and set `PAYMENT_VERIFY_URL` in `config.js`.

## Storage buckets
The SQL creates:
- product-images (public)
- profile-images (public)
- verification-docs (private)

## Working Design Add-ons Included
This build keeps the same v19 design and adds:
- AI Helper page + floating AI button
- Seller listing AI helper button
- Wishlist using local storage
- Coupon box at checkout with capped discount tiers
- Shipping estimate by product weight
- Admin analytics page
- Admin seller detail view in approvals
- Product in-site message form
- Better badges/rewards styling without changing the main design

## SQL
No full reset is required. If you want the new shipping/coupon fields to save in Supabase, run:
`supabase-working-addons.sql`

This SQL is safe and uses `ADD COLUMN IF NOT EXISTS`.
