-- HARVESTER PARTS COMPLETE FRESH SCHEMA
-- Run in Supabase SQL editor. This drops old public tables used by this project, then creates fresh tables.

create extension if not exists "uuid-ossp";

drop table if exists public.reviews cascade;
drop table if exists public.reports cascade;
drop table if exists public.chat_messages cascade;
drop table if exists public.conversations cascade;
drop table if exists public.orders cascade;
drop table if exists public.cart_items cascade;
drop table if exists public.reward_events cascade;
drop table if exists public.seller_plans cascade;
drop table if exists public.verifications cascade;
drop table if exists public.product_images cascade;
drop table if exists public.products cascade;
drop table if exists public.brands cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;
drop table if exists public.plans cascade;

create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique,
  full_name text not null,
  phone text,
  email text,
  role text check (role in ('Buyer','Seller','Dealer','Admin')) default 'Buyer',
  language text default 'English',
  country text default 'India',
  state text,
  district text,
  city text,
  village text,
  reward_points int default 0,
  seller_score int default 0,
  is_verified boolean default false,
  created_at timestamptz default now()
);

create table public.categories (id uuid primary key default uuid_generate_v4(), slug text unique not null, name text not null, parent_slug text, active boolean default true);
create table public.brands (id uuid primary key default uuid_generate_v4(), name text unique not null, models jsonb default '[]'::jsonb, active boolean default true);

create table public.products (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  category_slug text,
  brand text,
  model text,
  condition text check (condition in ('New','Used','Spare Part')) default 'Used',
  listing_type text check (listing_type in ('machine','part')) default 'machine',
  price numeric(12,2) not null default 0,
  currency text default 'INR',
  country text default 'India', state text, district text, city text, village text,
  stock int default 1,
  status text check (status in ('pending','approved','rejected','sold','inactive')) default 'pending',
  featured boolean default false,
  views int default 0,
  rating numeric(2,1) default 0,
  created_at timestamptz default now()
);

create table public.product_images (id uuid primary key default uuid_generate_v4(), product_id uuid references public.products(id) on delete cascade, image_url text not null, sort_order int default 0);
create table public.verifications (id uuid primary key default uuid_generate_v4(), profile_id uuid references public.profiles(id) on delete cascade, aadhaar_front_url text, aadhaar_back_url text, shop_photo_url text, phone_otp_verified boolean default false, status text default 'pending', admin_note text, created_at timestamptz default now());

create table public.plans (id uuid primary key default uuid_generate_v4(), name text not null, price_inr int not null, listing_limit int not null, boosts int default 0, duration_days int default 30, features jsonb default '[]'::jsonb, active boolean default true);
create table public.seller_plans (id uuid primary key default uuid_generate_v4(), profile_id uuid references public.profiles(id) on delete cascade, plan_id uuid references public.plans(id), payment_id text, status text default 'active', starts_at timestamptz default now(), ends_at timestamptz);
create table public.reward_events (id uuid primary key default uuid_generate_v4(), profile_id uuid references public.profiles(id) on delete cascade, event_type text not null, points int not null, badge_title text, created_at timestamptz default now());
create table public.orders (id uuid primary key default uuid_generate_v4(), buyer_id uuid references public.profiles(id), total numeric(12,2), payment_provider text default 'razorpay', payment_id text, status text default 'created', created_at timestamptz default now());
create table public.conversations (id uuid primary key default uuid_generate_v4(), product_id uuid references public.products(id), buyer_id uuid references public.profiles(id), seller_id uuid references public.profiles(id), created_at timestamptz default now());
create table public.chat_messages (id uuid primary key default uuid_generate_v4(), conversation_id uuid references public.conversations(id) on delete cascade, sender_id uuid references public.profiles(id), message text not null, seen boolean default false, created_at timestamptz default now());
create table public.reviews (id uuid primary key default uuid_generate_v4(), product_id uuid references public.products(id), reviewer_id uuid references public.profiles(id), seller_id uuid references public.profiles(id), rating int check (rating between 1 and 5), comment text, created_at timestamptz default now());
create table public.reports (id uuid primary key default uuid_generate_v4(), product_id uuid references public.products(id), reporter_id uuid references public.profiles(id), reason text, status text default 'open', created_at timestamptz default now());

insert into public.plans(name,price_inr,listing_limit,boosts,features) values
('Starter',999,5,0,'["5 listings","Basic seller profile"]'),('Kisan Plus',2999,20,2,'["20 listings","2 boosts","Rewards"]'),('Trader',4999,50,5,'["50 listings","Lead tracking"]'),('Dealer Gold',7999,120,12,'["Dealer badge","12 boosts"]'),('Royal Dealer',11999,250,25,'["Storefront","Priority support"]'),('Enterprise',15999,999,60,'["Multi city","Bulk uploads"]');

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.verifications enable row level security;
alter table public.conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.orders enable row level security;
alter table public.reward_events enable row level security;

create policy "public approved products readable" on public.products for select using (status='approved' or auth.uid() is not null);
create policy "authenticated can insert products" on public.products for insert with check (auth.uid() is not null);
create policy "authenticated profiles readable" on public.profiles for select using (true);
create policy "authenticated can create profile" on public.profiles for insert with check (auth.uid() is not null);
