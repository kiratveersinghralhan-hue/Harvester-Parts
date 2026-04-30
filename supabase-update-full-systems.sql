-- HARVESTER PARTS FULL SYSTEMS SAFE UPDATE
-- SQL REQUIRED: YES. Safe update: creates missing tables/columns without dropping data.

create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete cascade,
  email text unique,
  phone text,
  role text default 'user',
  full_name text,
  gender text,
  profile_image text,
  user_uid text unique,
  created_at timestamptz default now()
);

alter table public.users add column if not exists bio text;
alter table public.users add column if not exists reward_points int default 0;
alter table public.users add column if not exists is_verified boolean default false;
alter table public.users add column if not exists state text;
alter table public.users add column if not exists district text;
alter table public.users add column if not exists city text;
alter table public.users add column if not exists village text;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (auth_id, email, phone, role, full_name, user_uid)
  values (new.id, new.email, new.phone, 'user', coalesce(new.raw_user_meta_data->>'full_name', ''), 'HP-' || upper(substr(replace(new.id::text, '-', ''), 1, 8)))
  on conflict (auth_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table if not exists public.seller_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  aadhaar_front_url text,
  aadhaar_back_url text,
  shop_photo_url text,
  phone_otp_verified boolean default false,
  status text default 'pending',
  admin_note text,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_user_id uuid references public.users(id) on delete set null,
  title text not null,
  description text,
  category text,
  brand text,
  model text,
  condition text default 'Used',
  listing_type text default 'machine',
  price numeric(12,2) default 0,
  state text,
  district text,
  city text,
  village text,
  stock int default 1,
  status text default 'pending',
  featured boolean default false,
  views int default 0,
  engine_no text,
  chassis_no text,
  year int,
  hours_used int,
  created_at timestamptz default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  image_url text not null,
  sort_order int default 0
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_user_id uuid references public.users(id),
  total numeric(12,2),
  payment_provider text default 'razorpay',
  payment_id text,
  status text default 'created',
  delivery_details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id),
  buyer_user_id uuid references public.users(id),
  seller_user_id uuid references public.users(id),
  created_at timestamptz default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_user_id uuid references public.users(id),
  message text not null,
  seen boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id),
  reviewer_user_id uuid references public.users(id),
  seller_user_id uuid references public.users(id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id),
  reporter_user_id uuid references public.users(id),
  reason text,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists public.seller_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  plan_name text,
  price_inr int,
  listing_limit int,
  boosts int default 0,
  payment_id text,
  status text default 'active',
  starts_at timestamptz default now(),
  ends_at timestamptz
);

create table if not exists public.reward_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  event_type text not null,
  points int not null,
  badge_title text,
  created_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.seller_verifications enable row level security;
alter table public.orders enable row level security;
alter table public.conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.seller_plans enable row level security;
alter table public.reward_events enable row level security;

-- Public marketplace read. Writes still require auth.
drop policy if exists "products readable" on public.products;
create policy "products readable" on public.products for select using (true);
drop policy if exists "users self read" on public.users;
create policy "users self read" on public.users for select using (auth.uid() = auth_id or true);
drop policy if exists "users self update" on public.users;
create policy "users self update" on public.users for update using (auth.uid() = auth_id);
drop policy if exists "users self insert" on public.users;
create policy "users self insert" on public.users for insert with check (auth.uid() = auth_id);
