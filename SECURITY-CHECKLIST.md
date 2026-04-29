# Production Security Checklist

- Do not commit Supabase service role keys.
- Keep only Supabase anon key in frontend.
- Turn on Row Level Security in Supabase.
- Run `supabase-schema.sql` in SQL editor before launch.
- Create Storage buckets: product-images, verification-docs, avatars.
- Set `verification-docs` private.
- Review seller approval manually before enabling selling.
- Use Razorpay live key only after testing payments.
- Replace `your-domain.com` in sitemap/robots.
- Test mobile, seller upload, chat, admin approvals, and plan purchase before launch.
