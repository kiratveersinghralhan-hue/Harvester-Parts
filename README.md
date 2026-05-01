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

## v20 update notes
- SQL required: No, if you already ran v19 `final-production.sql`.
- Seller verification now validates image-only uploads and limits Aadhaar photos to 3 MB each.
- Admin can view seller details and open secure signed links for verification documents.
- Product enquiry is now in-site messaging from the product page.

## Farmer Mode upgrade notes
This ZIP is a frontend/UX upgrade based on your v20 build.

SQL required: No, if your v20 database is already set up.

Added:
- Farmer-first homepage with Buy Machine / Sell Machine / Spare Parts actions
- Mobile bottom navigation
- Faster quick-sell form with optional advanced details
- AI helper button for listing title/description draft
- Improved product details with trust/safety blocks
- In-site messaging remains the main product enquiry path
- Better mobile responsiveness and touch actions
