-- Harvester Parts final production database setup
-- Run once in Supabase SQL Editor. Safe to rerun: uses IF NOT EXISTS / CREATE OR REPLACE.

create extension if not exists pgcrypto;

create table if not exists public.users (
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

create table if not exists public.sellers (
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

create table if not exists public.products (
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

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.users(id) on delete set null,
  total numeric default 0,
  status text default 'created',
  payment_method text,
  razorpay_payment_id text,
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity int default 1,
  price numeric default 0
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  sender_id uuid references public.users(id) on delete set null,
  receiver_id uuid references public.users(id) on delete set null,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  rating int default 5 check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table if not exists public.seller_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  plan_name text,
  amount numeric,
  status text default 'active',
  created_at timestamptz default now(),
  expires_at timestamptz
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users(auth_id,email,phone,role,full_name,user_uid)
  values(new.id,new.email,new.phone,'user',coalesce(new.raw_user_meta_data->>'full_name',''),'HP-' || upper(substr(replace(new.id::text,'-',''),1,8)))
  on conflict (auth_id) do update set email=excluded.email, phone=excluded.phone;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Storage buckets
insert into storage.buckets (id, name, public) values ('product-images','product-images',true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('profile-images','profile-images',true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('verification-docs','verification-docs',false) on conflict (id) do nothing;

-- Enable RLS
alter table public.users enable row level security;
alter table public.sellers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.seller_plans enable row level security;

-- Helper: current app user id
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.users where auth_id = auth.uid() and role = 'admin');
$$;

create or replace function public.current_profile_id()
returns uuid language sql stable as $$
  select id from public.users where auth_id = auth.uid() limit 1;
$$;

-- Drop old policies for clean rerun
DO $$ DECLARE r record; BEGIN
  FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname='public' AND tablename IN ('users','sellers','products','orders','order_items','messages','reviews','seller_plans')) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Users
create policy "Users can read own profile" on public.users for select using (auth_id = auth.uid() or public.is_admin());
create policy "Users can update own profile" on public.users for update using (auth_id = auth.uid()) with check (auth_id = auth.uid());
create policy "Admins can manage users" on public.users for all using (public.is_admin());

-- Sellers
create policy "Users can submit seller verification" on public.sellers for insert with check (user_id = public.current_profile_id());
create policy "Users can read own seller verification" on public.sellers for select using (user_id = public.current_profile_id() or status='approved' or public.is_admin());
create policy "Users can update own pending seller verification" on public.sellers for update using (user_id = public.current_profile_id());
create policy "Admins can manage sellers" on public.sellers for all using (public.is_admin());

-- Products
create policy "Anyone can read approved products" on public.products for select using (status='approved' or seller_id=public.current_profile_id() or public.is_admin());
create policy "Sellers can create products" on public.products for insert with check (seller_id=public.current_profile_id());
create policy "Sellers can update own products" on public.products for update using (seller_id=public.current_profile_id());
create policy "Admins can manage products" on public.products for all using (public.is_admin());

-- Orders
create policy "Buyers can create orders" on public.orders for insert with check (buyer_id=public.current_profile_id());
create policy "Buyers can read own orders" on public.orders for select using (buyer_id=public.current_profile_id() or public.is_admin());
create policy "Admins can manage orders" on public.orders for all using (public.is_admin());
create policy "Order items insert by logged in" on public.order_items for insert with check (auth.uid() is not null);
create policy "Order items read by logged in" on public.order_items for select using (auth.uid() is not null);

-- Messages
create policy "Users can send messages" on public.messages for insert with check (sender_id=public.current_profile_id());
create policy "Users can read own messages" on public.messages for select using (sender_id=public.current_profile_id() or receiver_id=public.current_profile_id() or public.is_admin());

-- Reviews
create policy "Anyone can read reviews" on public.reviews for select using (true);
create policy "Logged users can create reviews" on public.reviews for insert with check (user_id=public.current_profile_id());

-- Plans
create policy "Users can read own plans" on public.seller_plans for select using (user_id=public.current_profile_id() or public.is_admin());
create policy "Users can create own plans" on public.seller_plans for insert with check (user_id=public.current_profile_id());

-- Storage policies
DO $$ DECLARE r record; BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname LIKE 'HP %') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;
create policy "HP public product images read" on storage.objects for select using (bucket_id in ('product-images','profile-images'));
create policy "HP users upload product images" on storage.objects for insert with check (bucket_id in ('product-images','profile-images') and auth.uid() is not null);
create policy "HP users update own images" on storage.objects for update using (bucket_id in ('product-images','profile-images') and auth.uid() is not null);
create policy "HP private docs owner upload" on storage.objects for insert with check (bucket_id='verification-docs' and auth.uid() is not null);
create policy "HP private docs owner read" on storage.objects for select using (bucket_id='verification-docs' and auth.uid() is not null);
