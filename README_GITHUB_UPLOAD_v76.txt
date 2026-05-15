Harvester Parts v76 - seller/admin workflow patch

What changed:
1) Sell form now has clear tappable Machinery / Spare Part selector.
2) Category dropdown changes automatically based on Machinery vs Spare Part.
3) Seller verification now asks for Aadhaar front, Aadhaar back, and shop/stock photo.
4) Admin panel now has pending sellers, approved sellers, rejected/banned sellers, pending products, live products, product archive, orders, reports, and support messages.
5) Admin can approve, reject, ban, restore sellers/products and update order/report/support statuses.
6) Admin can open seller document previews through secure signed Supabase Storage links.
7) Admin/product loading now fetches all products for admin instead of only public/own products.
8) Cache version bumped to v76.
9) Package has one main root folder only: harvester-parts-github-v76. There are no nested project folders.

Important Supabase step:
If you already ran the old SQL, run SUPABASE_v76_ADMIN_PATCH.sql once in Supabase SQL Editor.
It is non-destructive and keeps your existing users/products/sellers.

GitHub upload:
1) Unzip this package.
2) Open the harvester-parts-github-v76 folder.
3) Upload all files inside to your GitHub repo root.
4) Commit changes.
5) Refresh the website twice or clear Safari/PWA cache if old files still show.
