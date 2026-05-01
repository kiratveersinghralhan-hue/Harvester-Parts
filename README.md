# Harvester Parts — Go Live Final Build

This is a clean production MVP for Harvester Parts.

## Upload
Upload all files in this folder to GitHub Pages. No subfolders are required.

## Required steps before launch

### 1. Add public keys
Open `config.js` and replace:
- `YOUR_SUPABASE_URL`
- `YOUR_SUPABASE_ANON_KEY`
- `YOUR_RAZORPAY_KEY_ID`
- `YOUR_ADMIN_EMAIL`
- `WHATSAPP_NUMBER`

Never add Supabase service_role key in frontend files.

### 2. Run SQL once
Run `final-production.sql` once in Supabase SQL Editor.

This creates:
- users / profiles
- sellers verification
- products
- orders + order items
- messages
- reviews
- seller plans
- storage buckets and policies
- auth trigger for automatic profile creation

### 3. Set yourself as admin
After your account is created, run:

```sql
update public.users
set role = 'admin'
where email = 'YOUR_ADMIN_EMAIL';
```

### 4. Supabase settings
Enable Authentication with email/password.
Buckets are created by SQL:
- product-images public
- profile-images public
- verification-docs private

### 5. Razorpay
Add your Razorpay Key ID in `config.js`.
Important: this frontend-only version opens Razorpay Checkout and stores paid order after success callback. For bank-grade payment verification, add a small server/edge function later to verify Razorpay signatures.

## No fake catalog
This build shows only approved products from Supabase. At launch, sellers must post listings and admin must approve them.

## How users use it
1. Create account / login
2. Become seller and submit verification
3. Admin approves seller
4. Seller posts product
5. Admin approves product
6. Buyers browse, add spare parts to cart, checkout, or send enquiry for machinery

## SQL required?
Yes, for this build: run `final-production.sql` once.
