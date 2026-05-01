# Harvester Parts — Production Fix

## Upload
Upload/replace these files in GitHub Pages.

## Keys
Edit `config.js` only:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `RAZORPAY_KEY_ID`
- `ADMIN_EMAIL`
- `WHATSAPP_NUMBER`

## SQL REQUIRED
Run `final-production.sql` once in Supabase SQL Editor.

This is a clean production setup for the Harvester Parts app tables. It fixes:
- public schema permission denied
- login/create account confusion
- profile update permissions
- admin role access
- seller verification tables
- product posting tables
- orders/cart tables
- messages/reviews/rewards/badges tables
- storage buckets and policies

After SQL, make your account admin:

```sql
update public.users set role='admin' where email='YOUR_EMAIL_HERE';
```

## Go-live test order
1. Create/login account
2. Save profile and profile photo
3. Run admin SQL above
4. Open Admin panel
5. Submit seller verification from another account
6. Approve seller from admin
7. Seller posts product
8. Admin approves product
9. Buyer adds spare part to cart / sends enquiry for machine

## Notes
No fake catalog is included. Marketplace shows live approved products only.
