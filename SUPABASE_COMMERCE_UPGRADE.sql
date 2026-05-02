-- Harvester Parts v46 optional commerce upgrade
-- Safe to run after your clean schema. Adds fields used by orders, tracking, reviews, stock and delivery.

alter table public.products add column if not exists stock_qty integer default 1;
alter table public.products add column if not exists avg_rating numeric default 4.6;
alter table public.products add column if not exists review_count integer default 0;
alter table public.products add column if not exists delivery_eta text default '3-7 days';
alter table public.products add column if not exists buyer_protection boolean default true;

alter table public.orders add column if not exists delivery_name text;
alter table public.orders add column if not exists delivery_phone text;
alter table public.orders add column if not exists delivery_city text;
alter table public.orders add column if not exists delivery_pincode text;
alter table public.orders add column if not exists delivery_address text;
alter table public.orders add column if not exists shipping_method text default 'standard';
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists tracking_status text default 'placed';
alter table public.orders add column if not exists courier_partner text;
alter table public.orders add column if not exists awb_code text;
alter table public.orders add column if not exists invoice_url text;

create table if not exists public.cart (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid,
  local_product_id text,
  quantity integer default 1,
  created_at timestamptz default now(),
  unique(user_id, product_id, local_product_id)
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  event_type text,
  product_id uuid,
  local_product_id text,
  page text,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.cart enable row level security;
alter table public.analytics_events enable row level security;

grant select, insert, update, delete on public.cart to authenticated;
grant select, insert on public.analytics_events to authenticated, anon;

drop policy if exists cart_owner_all on public.cart;
create policy cart_owner_all on public.cart for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists analytics_insert_any on public.analytics_events;
create policy analytics_insert_any on public.analytics_events for insert to anon, authenticated
with check (true);

drop policy if exists analytics_admin_read on public.analytics_events;
create policy analytics_admin_read on public.analytics_events for select to authenticated
using (public.is_admin());
