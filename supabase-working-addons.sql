-- Harvester Parts optional production addons for shipping/coupon/product weight.
-- Safe to run on top of v19/v20 schema. It does not delete existing data.

alter table if exists public.products
  add column if not exists weight_kg numeric,
  add column if not exists is_featured boolean default false,
  add column if not exists boost_level text,
  add column if not exists view_count integer default 0;

alter table if exists public.orders
  add column if not exists shipping_fee numeric default 0,
  add column if not exists shipping_method text,
  add column if not exists coupon_code text,
  add column if not exists discount_amount numeric default 0,
  add column if not exists platform_fee numeric default 0,
  add column if not exists tracking_number text,
  add column if not exists tracking_url text;

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text default 'percent',
  discount_value numeric not null,
  min_order numeric default 0,
  max_discount numeric default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

insert into public.coupons (code, discount_type, discount_value, min_order, max_discount)
values
 ('HPWELCOME','percent',3,2000,150),
 ('HP5K','percent',4,5000,250),
 ('HP10K','percent',5,10000,750),
 ('HP50K','percent',8,50000,3500),
 ('HP1LAKH','percent',15,100000,10000)
on conflict (code) do nothing;
