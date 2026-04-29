-- Harvester Parts fresh Supabase schema
-- Run in Supabase SQL editor. WARNING: the first section drops old marketplace tables.

begin;

drop table if exists reward_events cascade;
drop table if exists rewards cascade;
drop table if exists cart_items cascade;
drop table if exists orders cascade;
drop table if exists enquiries cascade;
drop table if exists listings cascade;
drop table if exists seller_verifications cascade;
drop table if exists subscriptions cascade;
drop table if exists plans cascade;
drop table if exists machine_models cascade;
drop table if exists machine_brands cascade;
drop table if exists categories cascade;
drop table if exists profiles cascade;

drop type if exists user_role cascade;
drop type if exists verification_status cascade;
drop type if exists listing_status cascade;
drop type if exists listing_type cascade;
drop type if exists condition_type cascade;

create type user_role as enum ('buyer','seller','dealer','admin');
create type verification_status as enum ('not_submitted','pending','approved','rejected');
create type listing_status as enum ('draft','pending','approved','rejected','sold','archived');
create type listing_type as enum ('machine','spare_part');
create type condition_type as enum ('new','used','refurbished');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text unique,
  email text,
  role user_role not null default 'buyer',
  language_code text default 'en',
  country text,
  state text,
  district text,
  city text,
  village text,
  reward_points integer not null default 0,
  badge_title text default 'Seed Starter',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon text,
  description text,
  parent_id uuid references categories(id) on delete set null,
  is_active boolean default true
);

create table machine_brands (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  country text,
  logo_url text,
  is_active boolean default true
);

create table machine_models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references machine_brands(id) on delete cascade,
  model_name text not null,
  machine_type text,
  hp_range text,
  compatible_parts jsonb default '[]'::jsonb,
  unique(brand_id, model_name)
);

create table plans (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  price_inr integer not null,
  active_listing_limit integer,
  featured_boosts integer default 0,
  reward_multiplier numeric default 1,
  benefits jsonb default '[]'::jsonb,
  is_active boolean default true
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  plan_id uuid references plans(id),
  status text default 'pending',
  starts_at timestamptz,
  ends_at timestamptz,
  payment_reference text,
  created_at timestamptz default now()
);

create table seller_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  status verification_status default 'pending',
  aadhaar_front_url text,
  aadhaar_back_url text,
  shop_photo_url text,
  phone_otp_verified boolean default false,
  business_name text,
  gst_number text,
  address text,
  admin_notes text,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create table listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references profiles(id) on delete cascade,
  category_id uuid references categories(id),
  brand_id uuid references machine_brands(id),
  model_id uuid references machine_models(id),
  title text not null,
  description text,
  listing_type listing_type not null,
  condition condition_type not null,
  price numeric not null,
  currency text default 'INR',
  country text,
  state text,
  district text,
  city text,
  village text,
  manufacture_year integer,
  usage_hours integer,
  images jsonb default '[]'::jsonb,
  status listing_status default 'pending',
  is_featured boolean default false,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  buyer_id uuid references profiles(id) on delete set null,
  seller_id uuid references profiles(id) on delete set null,
  message text,
  phone text,
  status text default 'open',
  created_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references profiles(id) on delete set null,
  status text default 'cart',
  total_amount numeric default 0,
  currency text default 'INR',
  address jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  listing_id uuid references listings(id) on delete cascade,
  quantity integer default 1,
  price numeric not null
);

create table rewards (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  description text,
  points integer default 0,
  badge text,
  is_active boolean default true
);

create table reward_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  reward_id uuid references rewards(id),
  points integer not null,
  note text,
  created_at timestamptz default now()
);

insert into plans (name, price_inr, active_listing_limit, featured_boosts, reward_multiplier, benefits) values
('Starter', 999, 3, 0, 1.0, '["3 active listings","Basic seller badge","Phone support ticket"]'),
('Grower', 1999, 10, 2, 1.2, '["10 active listings","2 featured boosts","WhatsApp enquiry button"]'),
('Trader', 3999, 25, 5, 1.3, '["25 active listings","Dealer profile page","Lead inbox access"]'),
('Dealer Pro', 6999, 60, 10, 1.5, '["60 active listings","Priority verification","Top area placement"]'),
('Agri Gold', 9999, 120, 20, 1.8, '["120 active listings","Homepage spotlight","Bulk upload ready"]'),
('Global Elite', 15999, null, 40, 2.0, '["Unlimited draft listings","Global dealer badge","Premium support"]');

insert into rewards (code,title,description,points,badge) values
('signup','Seed Starter','Complete signup and language setup',50,'🌱'),
('verified_seller','Verified Kisan Seller','Aadhaar, phone OTP and shop photo approved',250,'🛡️'),
('first_listing','First Machine Listed','First approved machine listing',150,'🚜'),
('parts_pro','Parts Pro','Add 5 spare parts',200,'⚙️'),
('deal_maker','Deal Maker','Close a buy/sell enquiry',400,'🤝'),
('trusted_buyer','Trusted Buyer','Buy or enquire on verified listings',100,'🛒'),
('daily_task','Daily Field Task','Login/share/update/respond',20,'🔥'),
('agri_champion','Agri Champion','10 successful actions',1000,'👑');

alter table profiles enable row level security;
alter table seller_verifications enable row level security;
alter table listings enable row level security;
alter table enquiries enable row level security;
alter table orders enable row level security;
alter table cart_items enable row level security;
alter table reward_events enable row level security;

create policy "Public can read approved listings" on listings for select using (status = 'approved');
create policy "Users manage own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Sellers manage own listings" on listings for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
create policy "Users manage own verification" on seller_verifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users read own rewards" on reward_events for select using (auth.uid() = user_id);

commit;
