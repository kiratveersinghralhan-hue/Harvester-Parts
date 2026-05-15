-- Harvester Parts - CLEAN FULL SUPABASE RESET v72
-- Admin / platform owner email: kiratveersinghralhan@gmail.com
--
-- IMPORTANT:
-- 1) This script intentionally deletes old marketplace data/history by dropping app tables.
-- 2) Run this once in Supabase SQL Editor on the correct project.
-- 3) Auth users in auth.users are NOT deleted by this script. After running, sign up / log in
--    with kiratveersinghralhan@gmail.com and the app will create the admin profile automatically.
-- 4) Do not run the old optional patch SQL files with this reset. This file replaces them.

begin;

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Clean previous app tables/history. Auth users are kept intentionally.
-- -----------------------------------------------------------------------------
drop table if exists public.order_items cascade;
drop table if exists public.messages cascade;
drop table if exists public.seller_plans cascade;
drop table if exists public.boost_purchases cascade;
drop table if exists public.reports cascade;
drop table if exists public.contact_messages cascade;
drop table if exists public.orders cascade;
drop table if exists public.products cascade;
drop table if exists public.sellers cascade;
drop table if exists public.users cascade;

-- Storage media note:
-- Supabase blocks direct DELETE from storage.objects in SQL to prevent orphaned files.
-- If you want to remove old uploaded images/docs too, empty the product-images and
-- verification-docs buckets from Supabase Storage UI or Storage API before/after this reset.
-- This SQL still recreates the buckets' settings and RLS policies below.

-- -----------------------------------------------------------------------------
-- App helper functions
-- -----------------------------------------------------------------------------
create or replace function public.admin_email()
returns text
language sql
stable
as $$
  select 'kiratveersinghralhan@gmail.com'::text;
$$;

create or replace function public.current_email()
returns text
language sql
stable
as $$
  select lower(nullif(coalesce(auth.jwt() ->> 'email', ''), ''));
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_email() = public.admin_email(), false);
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Core tables
-- -----------------------------------------------------------------------------
create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique references auth.users(id) on delete cascade,
  email text unique,
  phone text,
  full_name text,
  gender text,
  role text not null default 'user' check (role in ('user', 'seller', 'admin')),
  user_uid text unique,
  badge_title text default 'Member',
  badge_color text default 'green',
  profile_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(auth_id) on delete cascade,
  business_name text,
  phone text,
  state text,
  district text,
  city text,
  address text,
  status text not null default 'pending' check (status in ('pending', 'provisional', 'approved', 'rejected')),
  verification_status text not null default 'pending' check (verification_status in ('pending', 'provisional', 'approved', 'rejected')),
  aadhaar_front text,
  shop_photo text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(auth_id) on delete cascade,
  seller_id uuid,
  sell_type text default 'spare' check (sell_type in ('machine', 'spare')),
  condition text default 'Used',
  title text not null,
  price numeric(12,2) not null default 0 check (price >= 0),
  category text,
  brand text,
  model text,
  weight_kg numeric(10,2) default 0 check (weight_kg >= 0),
  state text,
  district text,
  city text,
  description text,
  image text,
  image_urls jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  is_boosted boolean not null default false,
  boost_until timestamptz,
  views integer not null default 0 check (views >= 0),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_user_seller_fk foreign key (user_id) references public.sellers(user_id) on delete cascade
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.users(auth_id) on delete cascade,
  user_id uuid not null references public.users(auth_id) on delete cascade,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  shipping_amount numeric(12,2) not null default 0 check (shipping_amount >= 0),
  platform_fee numeric(12,2) not null default 0 check (platform_fee >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_id text,
  buyer_name text,
  buyer_phone text,
  address text,
  pincode text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null default 1 check (quantity > 0),
  price numeric(12,2) not null default 0 check (price >= 0),
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(auth_id) on delete cascade,
  receiver_id uuid references public.users(auth_id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  topic text,
  message text,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

create table public.seller_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(auth_id) on delete cascade,
  plan_name text,
  billing_cycle text default 'monthly',
  amount numeric(12,2) not null default 0 check (amount >= 0),
  status text not null default 'active' check (status in ('active', 'pending', 'cancelled', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.boost_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(auth_id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  boost_type text,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  status text not null default 'paid' check (status in ('pending', 'paid', 'cancelled', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.users(auth_id) on delete set null,
  target_type text,
  target_id uuid,
  reason text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Guard triggers: stop client-side role/status escalation
-- -----------------------------------------------------------------------------
create or replace function public.guard_users_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.email := lower(nullif(new.email, ''));

  if new.email is null then
    new.email := public.current_email();
  end if;

  if tg_op = 'INSERT' then
    if new.user_uid is null then
      new.user_uid := 'HP-' || upper(substr(replace(new.auth_id::text, '-', ''), 1, 8));
    end if;

    if new.email = public.admin_email() then
      new.role := 'admin';
      new.badge_title := 'Platform Owner / Admin';
      new.badge_color := 'gold';
    else
      new.role := 'user';
      new.badge_title := coalesce(new.badge_title, 'Member');
      new.badge_color := coalesce(new.badge_color, 'green');
    end if;
  else
    if not public.is_admin() then
      new.auth_id := old.auth_id;
      new.email := old.email;
      new.role := old.role;
      new.user_uid := old.user_uid;
      new.badge_title := old.badge_title;
      new.badge_color := old.badge_color;
    end if;

    if new.email = public.admin_email() then
      new.role := 'admin';
      new.badge_title := 'Platform Owner / Admin';
      new.badge_color := 'gold';
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_users_guard
before insert or update on public.users
for each row execute function public.guard_users_write();

create or replace function public.guard_sellers_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'pending';
      new.verification_status := 'pending';
      new.approved_at := null;
    else
      if old.status = 'approved' then
        new.status := old.status;
        new.verification_status := old.verification_status;
        new.approved_at := old.approved_at;
      else
        new.status := 'pending';
        new.verification_status := 'pending';
        new.approved_at := null;
      end if;
      new.user_id := old.user_id;
    end if;
  else
    if new.status = 'approved' and new.approved_at is null then
      new.approved_at := now();
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_sellers_guard
before insert or update on public.sellers
for each row execute function public.guard_sellers_write();

create or replace function public.guard_products_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'pending';
      new.is_boosted := false;
      new.boost_until := null;
      new.approved_at := null;
      new.seller_id := (select s.id from public.sellers s where s.user_id = new.user_id and s.status = 'approved' limit 1);
    else
      new.user_id := old.user_id;
      new.seller_id := old.seller_id;
      new.status := old.status;
      new.is_boosted := old.is_boosted;
      new.boost_until := old.boost_until;
      new.approved_at := old.approved_at;
    end if;
  else
    if new.status = 'approved' and new.approved_at is null then
      new.approved_at := now();
    end if;
    if new.seller_id is null then
      new.seller_id := (select s.id from public.sellers s where s.user_id = new.user_id limit 1);
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_products_guard
before insert or update on public.products
for each row execute function public.guard_products_write();

create or replace function public.guard_orders_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      new.buyer_id := auth.uid();
      new.user_id := auth.uid();
      new.status := 'pending';
    else
      new.buyer_id := old.buyer_id;
      new.user_id := old.user_id;
      new.amount := old.amount;
      new.shipping_amount := old.shipping_amount;
      new.platform_fee := old.platform_fee;
      if new.status not in ('pending', 'paid', old.status) then
        new.status := old.status;
      end if;
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_orders_guard
before insert or update on public.orders
for each row execute function public.guard_orders_write();

create trigger trg_seller_plans_touch
before update on public.seller_plans
for each row execute function public.touch_updated_at();

create trigger trg_boost_purchases_touch
before update on public.boost_purchases
for each row execute function public.touch_updated_at();

create trigger trg_reports_touch
before update on public.reports
for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index products_status_created_idx on public.products(status, created_at desc);
create index products_category_idx on public.products(category);
create index products_user_idx on public.products(user_id);
create index products_boost_idx on public.products(is_boosted, boost_until);
create index sellers_status_idx on public.sellers(status);
create index orders_buyer_idx on public.orders(buyer_id, created_at desc);
create index order_items_order_idx on public.order_items(order_id);
create index messages_sender_idx on public.messages(sender_id, created_at desc);
create index messages_receiver_idx on public.messages(receiver_id, created_at desc);
create index reports_status_idx on public.reports(status, created_at desc);

-- -----------------------------------------------------------------------------
-- Storage buckets
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif']),
  ('verification-docs', 'verification-docs', false, 10485760, array['image/jpeg','image/png','image/webp','image/gif','application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- -----------------------------------------------------------------------------
-- Grants
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant execute on function public.admin_email() to anon, authenticated;
grant execute on function public.current_email() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

grant select on public.users to anon, authenticated;
grant insert, update on public.users to authenticated;
grant delete on public.users to authenticated;

grant select on public.sellers to anon, authenticated;
grant insert, update, delete on public.sellers to authenticated;

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

grant select on public.orders to anon, authenticated;
grant insert, update, delete on public.orders to authenticated;

grant select on public.order_items to anon, authenticated;
grant insert, update, delete on public.order_items to authenticated;

grant select, insert, update, delete on public.messages to authenticated;

grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;

grant select, insert, update, delete on public.seller_plans to authenticated;
grant select, insert, update, delete on public.boost_purchases to authenticated;
grant select, insert, update, delete on public.reports to authenticated;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.users force row level security;
alter table public.sellers enable row level security;
alter table public.sellers force row level security;
alter table public.products enable row level security;
alter table public.products force row level security;
alter table public.orders enable row level security;
alter table public.orders force row level security;
alter table public.order_items enable row level security;
alter table public.order_items force row level security;
alter table public.messages enable row level security;
alter table public.messages force row level security;
alter table public.contact_messages enable row level security;
alter table public.contact_messages force row level security;
alter table public.seller_plans enable row level security;
alter table public.seller_plans force row level security;
alter table public.boost_purchases enable row level security;
alter table public.boost_purchases force row level security;
alter table public.reports enable row level security;
alter table public.reports force row level security;

-- users
create policy users_select_visible
on public.users for select
using (public.is_admin() or auth.uid() = auth_id);

create policy users_insert_own
on public.users for insert
to authenticated
with check (auth.uid() = auth_id and (email is null or lower(email) = public.current_email() or public.is_admin()));

create policy users_update_own_or_admin
on public.users for update
to authenticated
using (public.is_admin() or auth.uid() = auth_id)
with check (public.is_admin() or auth.uid() = auth_id);

create policy users_delete_admin
on public.users for delete
to authenticated
using (public.is_admin());

-- sellers
create policy sellers_select_visible
on public.sellers for select
using (status = 'approved' or public.is_admin() or auth.uid() = user_id);

create policy sellers_insert_own
on public.sellers for insert
to authenticated
with check (auth.uid() = user_id);

create policy sellers_update_own_or_admin
on public.sellers for update
to authenticated
using (public.is_admin() or auth.uid() = user_id)
with check (public.is_admin() or auth.uid() = user_id);

create policy sellers_delete_admin
on public.sellers for delete
to authenticated
using (public.is_admin());

-- products
create policy products_select_visible
on public.products for select
using (status = 'approved' or public.is_admin() or auth.uid() = user_id);

create policy products_insert_approved_seller
on public.products for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.sellers s
    where s.user_id = auth.uid()
      and s.status = 'approved'
      and s.verification_status = 'approved'
  )
);

create policy products_update_owner_pending_or_admin
on public.products for update
to authenticated
using (public.is_admin() or (auth.uid() = user_id and status in ('pending', 'rejected')))
with check (public.is_admin() or auth.uid() = user_id);

create policy products_delete_owner_pending_or_admin
on public.products for delete
to authenticated
using (public.is_admin() or (auth.uid() = user_id and status in ('pending', 'rejected')));

-- orders
create policy orders_select_own_or_admin
on public.orders for select
using (public.is_admin() or auth.uid() = buyer_id or auth.uid() = user_id);

create policy orders_insert_own
on public.orders for insert
to authenticated
with check (auth.uid() = buyer_id and auth.uid() = user_id);

create policy orders_update_own_or_admin
on public.orders for update
to authenticated
using (public.is_admin() or auth.uid() = buyer_id or auth.uid() = user_id)
with check (public.is_admin() or auth.uid() = buyer_id or auth.uid() = user_id);

create policy orders_delete_admin
on public.orders for delete
to authenticated
using (public.is_admin());

-- order_items
create policy order_items_select_own_or_admin
on public.order_items for select
using (
  public.is_admin()
  or exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.buyer_id = auth.uid() or o.user_id = auth.uid())
  )
);

create policy order_items_insert_for_own_order
on public.order_items for insert
to authenticated
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.buyer_id = auth.uid() or o.user_id = auth.uid())
  )
);

create policy order_items_update_admin
on public.order_items for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy order_items_delete_admin
on public.order_items for delete
to authenticated
using (public.is_admin());

-- messages
create policy messages_select_participant_or_admin
on public.messages for select
to authenticated
using (public.is_admin() or auth.uid() = sender_id or auth.uid() = receiver_id);

create policy messages_insert_sender
on public.messages for insert
to authenticated
with check (auth.uid() = sender_id and length(trim(message)) > 0);

create policy messages_update_participant_or_admin
on public.messages for update
to authenticated
using (public.is_admin() or auth.uid() = receiver_id)
with check (public.is_admin() or auth.uid() = receiver_id);

create policy messages_delete_admin
on public.messages for delete
to authenticated
using (public.is_admin());

-- contact messages
create policy contact_messages_insert_public
on public.contact_messages for insert
with check (true);

create policy contact_messages_select_admin
on public.contact_messages for select
using (public.is_admin());

create policy contact_messages_update_admin
on public.contact_messages for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy contact_messages_delete_admin
on public.contact_messages for delete
to authenticated
using (public.is_admin());

-- seller plans
create policy seller_plans_select_own_or_admin
on public.seller_plans for select
to authenticated
using (public.is_admin() or auth.uid() = user_id);

create policy seller_plans_insert_own_or_admin
on public.seller_plans for insert
to authenticated
with check (public.is_admin() or auth.uid() = user_id);

create policy seller_plans_update_admin
on public.seller_plans for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy seller_plans_delete_admin
on public.seller_plans for delete
to authenticated
using (public.is_admin());

-- boosts
create policy boost_purchases_select_own_or_admin
on public.boost_purchases for select
to authenticated
using (public.is_admin() or auth.uid() = user_id);

create policy boost_purchases_insert_own_or_admin
on public.boost_purchases for insert
to authenticated
with check (public.is_admin() or auth.uid() = user_id);

create policy boost_purchases_update_admin
on public.boost_purchases for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy boost_purchases_delete_admin
on public.boost_purchases for delete
to authenticated
using (public.is_admin());

-- reports
create policy reports_select_own_or_admin
on public.reports for select
to authenticated
using (public.is_admin() or auth.uid() = reporter_id);

create policy reports_insert_own
on public.reports for insert
to authenticated
with check (auth.uid() = reporter_id);

create policy reports_update_admin
on public.reports for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy reports_delete_admin
on public.reports for delete
to authenticated
using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Storage RLS policies
-- -----------------------------------------------------------------------------
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (
        policyname ilike '%product_images%'
        or policyname ilike '%product-images%'
        or policyname ilike '%verification_docs%'
        or policyname ilike '%verification-docs%'
        or coalesce(qual, '') ilike '%product-images%'
        or coalesce(qual, '') ilike '%verification-docs%'
        or coalesce(with_check, '') ilike '%product-images%'
        or coalesce(with_check, '') ilike '%verification-docs%'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', pol.policyname);
  end loop;
end $$;

create policy product_images_public_select
on storage.objects for select
using (bucket_id = 'product-images');

create policy product_images_owner_insert
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy product_images_owner_update
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text))
with check (bucket_id = 'product-images' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text));

create policy product_images_owner_delete
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text));

create policy verification_docs_owner_or_admin_select
on storage.objects for select
to authenticated
using (bucket_id = 'verification-docs' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text));

create policy verification_docs_owner_insert
on storage.objects for insert
to authenticated
with check (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy verification_docs_owner_update
on storage.objects for update
to authenticated
using (bucket_id = 'verification-docs' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text))
with check (bucket_id = 'verification-docs' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text));

create policy verification_docs_owner_delete
on storage.objects for delete
to authenticated
using (bucket_id = 'verification-docs' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text));

commit;

-- After running this reset:
-- 1) In Supabase Auth settings, enable Email login and/or Google/Phone providers as needed.
-- 2) Open the website and sign up/log in using kiratveersinghralhan@gmail.com.
-- 3) The frontend will create public.users with role='admin', and RLS also treats that email as admin.
