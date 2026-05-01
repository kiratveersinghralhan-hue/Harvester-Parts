-- Harvester Parts v19 Production Database
-- IMPORTANT: This is a clean production setup for launch. It resets PUBLIC schema tables.
-- Run once in Supabase SQL Editor before going live.

create extension if not exists "pgcrypto";

drop schema public cascade;
create schema public;
grant usage on schema public to anon, authenticated, service_role;
grant all on schema public to postgres, service_role;
grant usage on schema public to anon, authenticated, service_role;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete cascade,
  email text unique,
  phone text,
  role text default 'user' check (role in ('user','buyer','seller','dealer','admin')),
  full_name text,
  gender text,
  profile_image text,
  user_uid text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete cascade,
  business_name text not null,
  phone text,
  address text,
  aadhaar_front_url text,
  aadhaar_back_url text,
  shop_photo_url text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.users(id) on delete cascade,
  title text not null,
  sale_type text not null default 'machine' check (sale_type in ('machine','spare_part')),
  category text,
  brand text,
  model text,
  price numeric default 0,
  year int,
  condition text,
  engine_number text,
  chassis_number text,
  hours_used int,
  state text,
  district text,
  city text,
  village text,
  description text,
  image_url text,
  status text default 'pending' check (status in ('pending','approved','rejected','sold')),
  views int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.users(id) on delete set null,
  total numeric default 0,
  status text default 'created',
  payment_method text,
  razorpay_payment_id text,
  razorpay_order_id text,
  razorpay_signature text,
  created_at timestamptz default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity int default 1,
  price numeric default 0
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  sender_id uuid references public.users(id) on delete set null,
  receiver_id uuid references public.users(id) on delete set null,
  message text not null,
  created_at timestamptz default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  rating int default 5 check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table public.seller_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  plan_name text,
  amount numeric,
  listing_limit int,
  status text default 'active',
  created_at timestamptz default now(),
  expires_at timestamptz
);

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  badge_name text,
  points int default 0,
  created_at timestamptz default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  body text,
  type text default 'general',
  is_read boolean default false,
  created_at timestamptz default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  reason text not null,
  status text default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users(auth_id,email,phone,role,full_name,user_uid)
  values(new.id,new.email,new.phone,'user',coalesce(new.raw_user_meta_data->>'full_name',''),'HP-' || upper(substr(replace(new.id::text,'-',''),1,8)))
  on conflict (auth_id) do update set email=excluded.email, phone=excluded.phone;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into public.users(auth_id,email,phone,role,full_name,user_uid)
select id,email,phone,'user',coalesce(raw_user_meta_data->>'full_name',''),'HP-' || upper(substr(replace(id::text,'-',''),1,8)) from auth.users
on conflict (auth_id) do nothing;

insert into storage.buckets (id, name, public) values ('product-images','product-images',true) on conflict (id) do update set public=true;
insert into storage.buckets (id, name, public) values ('profile-images','profile-images',true) on conflict (id) do update set public=true;
insert into storage.buckets (id, name, public) values ('verification-docs','verification-docs',false) on conflict (id) do update set public=false;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;

alter table public.users enable row level security;
alter table public.sellers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.seller_plans enable row level security;
alter table public.rewards enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

create or replace function public.current_profile_id()
returns uuid language sql stable security definer set search_path=public as $$
  select id from public.users where auth_id = auth.uid() limit 1;
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists (select 1 from public.users where auth_id = auth.uid() and role = 'admin');
$$;

create policy users_select on public.users for select using (auth_id=auth.uid() or public.is_admin() or id=public.current_profile_id());
create policy users_insert on public.users for insert with check (auth_id=auth.uid());
create policy users_update on public.users for update using (auth_id=auth.uid() or public.is_admin()) with check (auth_id=auth.uid() or public.is_admin());

create policy sellers_insert on public.sellers for insert with check (user_id=public.current_profile_id());
create policy sellers_select on public.sellers for select using (user_id=public.current_profile_id() or status='approved' or public.is_admin());
create policy sellers_update on public.sellers for update using (user_id=public.current_profile_id() or public.is_admin()) with check (user_id=public.current_profile_id() or public.is_admin());
create policy sellers_delete on public.sellers for delete using (public.is_admin());

create policy products_select on public.products for select using (status='approved' or seller_id=public.current_profile_id() or public.is_admin());
create policy products_insert on public.products for insert with check (seller_id=public.current_profile_id());
create policy products_update on public.products for update using (seller_id=public.current_profile_id() or public.is_admin()) with check (seller_id=public.current_profile_id() or public.is_admin());
create policy products_delete on public.products for delete using (seller_id=public.current_profile_id() or public.is_admin());

create policy orders_insert on public.orders for insert with check (buyer_id=public.current_profile_id());
create policy orders_select on public.orders for select using (buyer_id=public.current_profile_id() or public.is_admin());
create policy orders_update on public.orders for update using (public.is_admin());

create policy order_items_insert on public.order_items for insert with check (auth.uid() is not null);
create policy order_items_select on public.order_items for select using (auth.uid() is not null or public.is_admin());

create policy messages_insert on public.messages for insert with check (sender_id=public.current_profile_id());
create policy messages_select on public.messages for select using (sender_id=public.current_profile_id() or receiver_id=public.current_profile_id() or public.is_admin());

create policy reviews_select on public.reviews for select using (true);
create policy reviews_insert on public.reviews for insert with check (user_id=public.current_profile_id());
create policy reviews_delete on public.reviews for delete using (public.is_admin());

create policy plans_select on public.seller_plans for select using (user_id=public.current_profile_id() or public.is_admin());
create policy plans_insert on public.seller_plans for insert with check (user_id=public.current_profile_id());

create policy rewards_select on public.rewards for select using (user_id=public.current_profile_id() or public.is_admin());
create policy rewards_insert on public.rewards for insert with check (user_id=public.current_profile_id() or public.is_admin());

create policy notifications_select on public.notifications for select using (user_id=public.current_profile_id() or public.is_admin());
create policy notifications_insert on public.notifications for insert with check (auth.uid() is not null or public.is_admin());
create policy notifications_update on public.notifications for update using (user_id=public.current_profile_id() or public.is_admin()) with check (user_id=public.current_profile_id() or public.is_admin());

create policy reports_insert on public.reports for insert with check (user_id=public.current_profile_id());
create policy reports_select on public.reports for select using (user_id=public.current_profile_id() or public.is_admin());
create policy reports_update on public.reports for update using (public.is_admin());

drop policy if exists hp_public_images_read on storage.objects;
drop policy if exists hp_public_images_upload on storage.objects;
drop policy if exists hp_public_images_update on storage.objects;
drop policy if exists hp_private_docs_upload on storage.objects;
drop policy if exists hp_private_docs_read on storage.objects;

create policy hp_public_images_read on storage.objects for select using (bucket_id in ('product-images','profile-images'));
create policy hp_public_images_upload on storage.objects for insert with check (bucket_id in ('product-images','profile-images') and auth.uid() is not null);
create policy hp_public_images_update on storage.objects for update using (bucket_id in ('product-images','profile-images') and auth.uid() is not null);
create policy hp_private_docs_upload on storage.objects for insert with check (bucket_id='verification-docs' and auth.uid() is not null);
create policy hp_private_docs_read on storage.objects for select using ((bucket_id='verification-docs' and auth.uid() is not null) or public.is_admin());

-- After running, make yourself admin:
-- update public.users set role='admin' where email='YOUR_EMAIL@example.com';
