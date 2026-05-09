-- Optional schema support for platform earnings reporting.
-- The website works without this, but run it if you want to store fees in Supabase later.
alter table public.orders add column if not exists buyer_platform_fee numeric default 0;
alter table public.orders add column if not exists platform_fee numeric default 0;
alter table public.order_items add column if not exists seller_platform_fee numeric default 0;
alter table public.order_items add column if not exists seller_net_amount numeric default 0;
alter table public.products add column if not exists seller_platform_fee numeric default 0;
alter table public.products add column if not exists seller_net_amount numeric default 0;
