-- Harvester Parts v54 boost/promote system (optional but recommended)
-- Run once if you want boost purchases and top placement stored in Supabase.

alter table public.products add column if not exists is_boosted boolean default false;
alter table public.products add column if not exists boosted_at timestamptz;
alter table public.products add column if not exists boosted_until timestamptz;
alter table public.products add column if not exists boost_price_paid numeric default 0;
alter table public.products add column if not exists boost_count integer default 0;

create table if not exists public.product_boosts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid,
  seller_id uuid,
  user_id uuid,
  amount numeric not null default 0,
  discount_amount numeric default 0,
  razorpay_payment_id text,
  status text default 'paid' check (status in ('pending','paid','failed','refunded')),
  starts_at timestamptz default now(),
  ends_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);

alter table public.product_boosts enable row level security;

drop policy if exists product_boosts_owner_select on public.product_boosts;
drop policy if exists product_boosts_owner_insert on public.product_boosts;
drop policy if exists product_boosts_admin_all on public.product_boosts;

create policy product_boosts_owner_select
on public.product_boosts for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

create policy product_boosts_owner_insert
on public.product_boosts for insert
to authenticated
with check (auth.uid() = user_id or public.is_admin());

create policy product_boosts_admin_all
on public.product_boosts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select, insert, update on public.product_boosts to authenticated;
grant select, update on public.products to authenticated;
