-- Harvester Parts FULL CLEAN DATABASE SETUP
-- WARNING: This deletes all public tables/data and rebuilds fresh.
-- Replace YOUR_ADMIN_EMAIL@gmail.com with your login email before running.

drop schema public cascade;
create schema public;
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;
create extension if not exists "pgcrypto";

create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete cascade,
  email text,
  phone text,
  role text default 'user' check (role in ('user','buyer','seller','dealer','admin')),
  full_name text,
  gender text,
  profile_image text,
  user_uid text unique,
  badge_title text default 'New Member',
  badge_color text default 'green',
  profile_completed boolean default false,
  created_at timestamptz default now()
);

create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(auth_id) on delete cascade,
  business_name text,
  phone text,
  state text,
  district text,
  city text,
  address text,
  status text default 'pending' check (status in ('pending','provisional','approved','rejected')),
  verification_status text default 'pending',
  aadhaar_front text,
  aadhaar_back text,
  shop_photo text,
  ai_review_note text,
  rejection_reason text,
  approved_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.sellers(id) on delete set null,
  user_id uuid references public.users(auth_id) on delete cascade,
  title text not null,
  description text,
  price numeric default 0,
  sale_type text default 'machine' check (sale_type in ('machine','spare_part')),
  category text,
  brand text,
  model text,
  condition text,
  year int,
  engine_number text,
  chassis_number text,
  hours_used numeric,
  weight_kg numeric default 0,
  state text,
  district text,
  city text,
  village text,
  image_url text,
  image_urls text[],
  status text default 'pending' check (status in ('pending','provisional','approved','rejected','sold','draft')),
  views int default 0,
  is_featured boolean default false,
  is_boosted boolean default false,
  created_at timestamptz default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.users(auth_id),
  user_id uuid references public.users(auth_id),
  amount numeric default 0,
  shipping_amount numeric default 0,
  discount_amount numeric default 0,
  status text default 'pending' check (status in ('pending','paid','failed','cancelled','shipped','delivered','refunded')),
  payment_id text,
  razorpay_order_id text,
  tracking_id text,
  tracking_url text,
  created_at timestamptz default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity int default 1,
  price numeric default 0
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.users(auth_id),
  receiver_id uuid references public.users(auth_id),
  product_id uuid references public.products(id),
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references public.users(auth_id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(auth_id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id,product_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(auth_id) on delete cascade,
  title text,
  message text,
  type text default 'info',
  is_read boolean default false,
  created_at timestamptz default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.users(auth_id),
  target_type text,
  target_id uuid,
  reason text,
  status text default 'open' check (status in ('open','reviewed','resolved','closed')),
  created_at timestamptz default now()
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  discount_type text default 'percentage',
  discount_value numeric default 0,
  min_order_value numeric default 0,
  max_discount numeric default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.seller_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(auth_id) on delete cascade,
  plan_name text,
  amount numeric default 0,
  status text default 'active',
  created_at timestamptz default now()
);

insert into public.coupons(code,discount_type,discount_value,min_order_value,max_discount,is_active) values
('HP2000','percentage',3,2000,100,true),
('HP10000','percentage',5,10000,700,true),
('HP100000','percentage',15,100000,10000,true)
on conflict (code) do nothing;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users(auth_id,email,phone,role,full_name,user_uid)
  values (new.id,new.email,new.phone,'user',coalesce(new.raw_user_meta_data->>'full_name',''),'HP-' || upper(substr(replace(new.id::text,'-',''),1,8)))
  on conflict (auth_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into public.users(auth_id,email,phone,role,user_uid)
select id,email,phone,'user','HP-' || upper(substr(replace(id::text,'-',''),1,8)) from auth.users
on conflict (auth_id) do nothing;

update public.users set role='admin' where email='YOUR_ADMIN_EMAIL@gmail.com';

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists(select 1 from public.users where auth_id=auth.uid() and role='admin');
$$;

alter table public.users enable row level security;
alter table public.sellers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlist enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.coupons enable row level security;
alter table public.seller_plans enable row level security;

create policy users_select on public.users for select using (auth.uid()=auth_id or public.is_admin());
create policy users_insert on public.users for insert with check (auth.uid()=auth_id or public.is_admin());
create policy users_update on public.users for update using (auth.uid()=auth_id or public.is_admin()) with check (auth.uid()=auth_id or public.is_admin());

create policy sellers_select on public.sellers for select using (auth.uid()=user_id or public.is_admin());
create policy sellers_insert on public.sellers for insert with check (auth.uid()=user_id or public.is_admin());
create policy sellers_update on public.sellers for update using (auth.uid()=user_id or public.is_admin()) with check (auth.uid()=user_id or public.is_admin());
create policy sellers_delete on public.sellers for delete using (public.is_admin());

create policy products_select on public.products for select using (status='approved' or auth.uid()=user_id or public.is_admin());
create policy products_insert on public.products for insert with check (auth.uid()=user_id or public.is_admin());
create policy products_update on public.products for update using (auth.uid()=user_id or public.is_admin()) with check (auth.uid()=user_id or public.is_admin());
create policy products_delete on public.products for delete using (auth.uid()=user_id or public.is_admin());

create policy orders_select on public.orders for select using (auth.uid()=buyer_id or auth.uid()=user_id or public.is_admin());
create policy orders_insert on public.orders for insert with check (auth.uid()=buyer_id or auth.uid()=user_id or public.is_admin());
create policy orders_update on public.orders for update using (auth.uid()=buyer_id or auth.uid()=user_id or public.is_admin()) with check (auth.uid()=buyer_id or auth.uid()=user_id or public.is_admin());

create policy order_items_select on public.order_items for select using (public.is_admin() or exists(select 1 from public.orders o where o.id=order_id and (o.buyer_id=auth.uid() or o.user_id=auth.uid())));
create policy order_items_insert on public.order_items for insert with check (public.is_admin() or exists(select 1 from public.orders o where o.id=order_id and (o.buyer_id=auth.uid() or o.user_id=auth.uid())));

create policy messages_select on public.messages for select using (auth.uid()=sender_id or auth.uid()=receiver_id or public.is_admin());
create policy messages_insert on public.messages for insert with check (auth.uid()=sender_id or public.is_admin());
create policy messages_update on public.messages for update using (auth.uid()=sender_id or auth.uid()=receiver_id or public.is_admin()) with check (auth.uid()=sender_id or auth.uid()=receiver_id or public.is_admin());

create policy reviews_select on public.reviews for select using (true);
create policy reviews_insert on public.reviews for insert with check (auth.uid()=user_id);
create policy reviews_update on public.reviews for update using (auth.uid()=user_id or public.is_admin()) with check (auth.uid()=user_id or public.is_admin());

create policy wishlist_select on public.wishlist for select using (auth.uid()=user_id or public.is_admin());
create policy wishlist_insert on public.wishlist for insert with check (auth.uid()=user_id or public.is_admin());
create policy wishlist_delete on public.wishlist for delete using (auth.uid()=user_id or public.is_admin());

create policy notifications_select on public.notifications for select using (auth.uid()=user_id or public.is_admin());
create policy notifications_insert on public.notifications for insert with check (auth.uid()=user_id or public.is_admin());
create policy notifications_update on public.notifications for update using (auth.uid()=user_id or public.is_admin()) with check (auth.uid()=user_id or public.is_admin());

create policy reports_insert on public.reports for insert with check (auth.uid()=reporter_id or public.is_admin());
create policy reports_select on public.reports for select using (auth.uid()=reporter_id or public.is_admin());
create policy reports_update on public.reports for update using (public.is_admin()) with check (public.is_admin());

create policy coupons_select on public.coupons for select using (is_active=true or public.is_admin());
create policy coupons_admin on public.coupons for all using (public.is_admin()) with check (public.is_admin());

create policy seller_plans_select on public.seller_plans for select using (auth.uid()=user_id or public.is_admin());
create policy seller_plans_insert on public.seller_plans for insert with check (auth.uid()=user_id or public.is_admin());

insert into storage.buckets(id,name,public) values
('product-images','product-images',true),
('profile-images','profile-images',true),
('verification-docs','verification-docs',false)
on conflict (id) do nothing;

drop policy if exists "product images public read" on storage.objects;
drop policy if exists "product images upload" on storage.objects;
drop policy if exists "profile images public read" on storage.objects;
drop policy if exists "profile images upload" on storage.objects;
drop policy if exists "verification docs private upload" on storage.objects;
drop policy if exists "verification docs private read" on storage.objects;

create policy "product images public read" on storage.objects for select using (bucket_id='product-images');
create policy "product images upload" on storage.objects for insert with check (bucket_id='product-images' and auth.uid() is not null);
create policy "profile images public read" on storage.objects for select using (bucket_id='profile-images');
create policy "profile images upload" on storage.objects for insert with check (bucket_id='profile-images' and auth.uid() is not null);
create policy "verification docs private upload" on storage.objects for insert with check (bucket_id='verification-docs' and auth.uid() is not null);
create policy "verification docs private read" on storage.objects for select using (bucket_id='verification-docs' and (auth.uid() is not null));
