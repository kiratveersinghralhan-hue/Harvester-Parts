# Harvester Parts v12 - Production Ready Upgrade

Upload/replace these files in your existing GitHub repo. Do not delete old files unless you want a clean repo.

## Before launch
1. Replace placeholders in `supabase-config.js`.
2. Run `supabase-schema.sql` in Supabase SQL Editor.
3. Create Supabase Storage buckets: `product-images`, `verification-docs`, `avatars`.
4. Replace `your-domain.com` in `sitemap.xml` and `robots.txt`.
5. Add Razorpay live key only when payment testing is complete.
6. Enable RLS policies in Supabase.
7. Test: signup, seller verification, add listing, chat, plan payment, admin approval, mobile menu.

## Deploy
Works with GitHub Pages, Netlify, Vercel static hosting, Cloudflare Pages.

For Netlify, `_redirects` and `_headers` are included.
For GitHub Pages, the app uses hash routing, so refresh will still work.

## Security
Never upload service-role keys to GitHub. Frontend can only use public anon keys.
