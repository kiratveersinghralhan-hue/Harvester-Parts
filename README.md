# Harvester Parts - Fresh Marketplace Starter

A GitHub-ready static frontend for a worldwide agriculture machinery marketplace.

## Included
- Animated intro screen
- Language popup with Indian + world languages
- Buyer / Seller / Dealer / Admin flows
- Marketplace with 90 demo machine and spare-part listings
- Product details route
- OLX-style enquiry for machines
- Cart-ready spare parts flow
- Seller verification UI: Aadhaar front/back, phone OTP, shop photo
- 6 seller plans from ₹999 to ₹15,999
- Rewards, badges and daily task UI
- Machine selector: Brand → Model → matches
- Admin dashboard mockup for KYC, listings, plans, reports, rewards
- Supabase schema with clean drop + fresh tables

## Files
- `index.html` - main app shell
- `styles.css` - full UI/UX styling and animations
- `data.js` - demo categories, brands, locations, plans, rewards and 90 fake listings
- `app.js` - frontend routing and UI logic
- `supabase-config.js` - add your public Supabase URL and anon key here
- `supabase-schema.sql` - run this in Supabase SQL editor

## Setup
1. Upload all files to your GitHub repo root.
2. Enable GitHub Pages or deploy on Netlify/Vercel.
3. Create a Supabase project.
4. Run `supabase-schema.sql` in Supabase SQL editor.
5. Add your public anon config in `supabase-config.js`.
6. Later connect frontend actions to Supabase tables.

## Important
Do not put Supabase service role keys in this project. Only use the public anon key in frontend.

## Suggested next backend steps
- Connect Supabase Auth for buyer/seller/dealer/admin login.
- Add Supabase Storage buckets for Aadhaar and shop photos.
- Wire listing creation to `listings` table with `pending` status.
- Wire admin approval to update verification/listing status.
- Add payment gateway later for plan purchases.
