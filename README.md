# Harvester Parts v8

GitHub-ready drop-in update. Upload/replace these root files in your existing GitHub Pages repo.

## What is included
- Dynamic Supabase-ready marketplace frontend
- Buyer / Seller / Dealer / Admin flows
- Login and signup using Supabase Auth
- Product posting with admin approval status
- Seller verification form with Aadhaar front/back + shop photo upload
- Admin approval table
- Enquiry system for machines
- Cart flow for spare parts
- Machine selector by brand/model/category
- Plans from ₹999 to ₹15,999 with visible pricing
- Custom SVG reward badges, no emoji badges
- Mobile responsive fixes, smoother page transitions, auto-closing menu, scroll-up button

## Setup steps

1. Upload the files to GitHub by replacing existing files. Do not delete your repo.
2. Open Supabase > SQL Editor.
3. Run `supabase-schema.sql` once.
4. Open Supabase > Authentication and enable Email login. Phone OTP can be enabled later.
5. Open `supabase-config.js` and add your public anon config:

```js
window.HP_SUPABASE = {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_PUBLIC_ANON_KEY"
};
```

Never paste your service role key into GitHub.

## Admin setup
After creating your admin account on the site, go to Supabase SQL editor and run:

```sql
update profiles set role = 'admin' where id = 'YOUR_USER_UUID';
```

You can find your user UUID in Supabase Authentication > Users.

## Storage
The SQL creates a public bucket named `seller-documents`. For production, make this private and use signed URLs. Current setup is easier for testing.

## Current mode
If Supabase keys are not added, the site runs in demo/local mode using `data.js`.
