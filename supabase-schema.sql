-- Harvester Parts fresh backend schema v8
-- Run in Supabase SQL editor. This creates a working marketplace backend.
-- WARNING: The DROP section removes older Harvester Parts demo tables.

create extension if not exists pgcrypto;

drop table if exists enquiries cascade;
drop table if exists plan_orders cascade;
drop table if exists seller_verifications cascade;
drop table if exists products cascade;
drop table if exists reward_badges cascade;
drop table if exists plans cascade;
drop table if exists profiles cascade;
drop table if exists brands cascade;
drop table if exists categories cascade;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('buyer','seller','dealer','admin')) default 'buyer',
  phone text,
  language text default 'en',
  created_at timestamptz default now()
);

create table categories (
  id text primary key,
  name text not null,
  icon text,
  sort_order int default 0
);

create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  models text[] default '{}',
  country text
);

create table plans (
  id text primary key,
  name text not null,
  price int not null,
  description text,
  features text[] default '{}',
  max_listings int default 0,
  featured_slots int default 0,
  active boolean default true
);

create table products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  category text references categories(id),
  category_name text,
  brand text,
  model text,
  type text check (type in ('machine','spare')) default 'machine',
  condition text check (condition in ('New','Used','Refurbished')) default 'Used',
  price numeric default 0,
  year int,
  hours int,
  country text default 'India',
  state text,
  city text,
  village text,
  image_url text,
  gallery_urls text[] default '{}',
  status text check (status in ('pending','approved','rejected','sold')) default 'pending',
  verified boolean default false,
  rating numeric default 4.5,
  seller_name text,
  created_at timestamptz default now()
);

create table seller_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  legal_name text not null,
  phone text not null,
  address text,
  aadhaar_front_url text,
  aadhaar_back_url text,
  shop_photo_url text,
  status text check (status in ('pending','approved','rejected')) default 'pending',
  admin_note text,
  created_at timestamptz default now()
);

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  buyer_id uuid references profiles(id) on delete set null,
  message text not null,
  status text default 'new',
  created_at timestamptz default now()
);

create table reward_badges (
  id text primary key,
  icon text default 'gold',
  title text not null,
  description text,
  points int default 0,
  trigger_code text
);

create table plan_orders (
  id uuid primary key default gen_random_uuid(),
  plan_id text references plans(id),
  user_id uuid references profiles(id) on delete set null,
  status text check (status in ('pending','paid','approved','cancelled')) default 'pending',
  created_at timestamptz default now()
);

insert into categories(id,name,icon,sort_order) values
('power','Power & Prime Movers','tractor',1),('land','Land Development','land',2),('tillage','Tillage / Soil Cultivation','soil',3),('planting','Planting & Sowing','seed',4),('irrigation','Irrigation & Water','water',5),('fertilizing','Fertilizing & Nutrients','nutrient',6),('protection','Crop Protection','shield',7),('cropcare','Intercultural & Crop Care','leaf',8),('harvesting','Harvesting Machinery','harvest',9),('post','Post-Harvest Processing','grain',10),('transport','Transport & Handling','truck',11),('forage','Hay & Forage','bale',12),('livestock','Livestock Field Machinery','feed',13),('orchard','Orchard & Plantation','tree',14),('smart','Precision & Smart Agri','gps',15),('spare','Spare Parts','gear',16);

insert into brands(name,models,country) values
('Mahindra',array['575 DI','Arjun Novo 605','Yuvo Tech+ 575','Jivo 245'],'India'),('Swaraj',array['735 FE','744 FE','855 FE','963 FE'],'India'),('Sonalika',array['DI 745','Tiger 55','RX 750','Sikander 60'],'India'),('John Deere',array['5050D','5310','5405','6120B'],'USA'),('New Holland',array['3630 TX','5620 TX','Excel 4710','Baler BC5060'],'Global'),('Massey Ferguson',array['241 DI','1035 DI','9500 Smart','2635 4WD'],'Global'),('Kubota',array['MU4501','MU5501','L4508','Harvesking DC-68G'],'Japan'),('CLAAS',array['Crop Tiger','Jaguar 950','Lexion 770','Dominator'],'Germany'),('Preet',array['6049','987','949 TAF','Combine 987'],'India'),('Shaktiman',array['Rotavator SRP','Super Seeder','Baler','Mulcher'],'India'),('Case IH',array['Puma 150','Axial Flow 4000','Farmall 75','Magnum 250'],'USA'),('Fendt',array['Vario 211','Vario 724','Ideal 8','Katana 650'],'Germany');

insert into plans(id,name,price,description,features,max_listings,featured_slots) values
('starter','Starter',999,'For small farmers testing online selling',array['2 active listings','Basic enquiry inbox','Seller profile','Bronze reward badge'],2,0),
('kisan-plus','Kisan Plus',1999,'For regular local sellers',array['8 active listings','District visibility','Photo gallery','Buyer contact requests'],8,1),
('dealer-basic','Dealer Basic',3999,'For shops and spare part dealers',array['25 active listings','Spare parts catalog','Lead dashboard','Verification badge'],25,2),
('growth','Growth',6999,'Most useful plan for serious sellers',array['60 active listings','Featured search slots','Priority support','Rewards multiplier'],60,4),
('premium-dealer','Premium Dealer',9999,'For high-volume machinery sellers',array['120 active listings','Homepage promotion','Team access ready','Analytics cards'],120,8),
('elite-global','Elite Global',15999,'For large dealers and exporters',array['Unlimited demo listings','Global marketplace badge','Top placement','Bulk upload ready'],9999,20);

insert into reward_badges(id,icon,title,description,points,trigger_code) values
('first-seed','bronze','First Seed','Create account and complete language setup',50,'signup'),
('verified-farmer','green','Verified Farmer','Complete Aadhaar, OTP and shop photo verification',250,'seller_verified'),
('first-listing','gold','First Listing','Post your first approved machine or part',150,'listing_approved'),
('trusted-trader','platinum','Trusted Trader','Complete a successful enquiry or sale',500,'sale_complete'),
('smart-buyer','green','Smart Buyer','Buy or enquire for a spare part',120,'buyer_enquiry'),
('daily-streak','bronze','Daily Streak','Login and complete daily marketplace task',30,'daily_login'),
('dealer-champion','platinum','Dealer Champion','Maintain high rating with approved listings',1000,'dealer_rating');

insert into products(title,description,category,category_name,brand,model,type,condition,price,year,hours,country,state,city,village,image_url,status,verified,rating,seller_name) values
('Mahindra 575 DI Tractor','Demo approved tractor listing for testing marketplace.', 'power','Power & Prime Movers','Mahindra','575 DI','machine','Used',385000,2018,1850,'India','Punjab','Ludhiana','Rampur','https://images.unsplash.com/photo-1605333396915-47ed6b68a00d?auto=format&fit=crop&w=1200&q=80','approved',true,4.6,'GreenGrow Dealers'),
('CLAAS Crop Tiger Combine Harvester','Premium combine harvester demo listing.', 'harvesting','Harvesting Machinery','CLAAS','Crop Tiger','machine','Used',1450000,2020,930,'India','Haryana','Karnal','Bhaini','https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80','approved',true,4.8,'Kisan Agro Hub'),
('Hydraulic Pump for Mahindra','New spare part demo listing with cart flow.', 'spare','Spare Parts','Mahindra','575 DI','spare','New',4500,2024,0,'India','Punjab','Jalandhar','Nakodar','https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=1200&q=80','approved',true,4.4,'Parts Palace');

alter table profiles enable row level security;
alter table products enable row level security;
alter table seller_verifications enable row level security;
alter table enquiries enable row level security;
alter table plans enable row level security;
alter table reward_badges enable row level security;
alter table categories enable row level security;
alter table brands enable row level security;
alter table plan_orders enable row level security;

create policy "public read products" on products for select using (true);
create policy "users insert products" on products for insert with check (true);
create policy "users update own products or admin" on products for update using (auth.uid() = seller_id or exists(select 1 from profiles where id=auth.uid() and role='admin'));
create policy "public read categories" on categories for select using (true);
create policy "public read brands" on brands for select using (true);
create policy "public read plans" on plans for select using (true);
create policy "public read rewards" on reward_badges for select using (true);
create policy "profile read own" on profiles for select using (auth.uid()=id or exists(select 1 from profiles where id=auth.uid() and role='admin'));
create policy "profile insert own" on profiles for insert with check (auth.uid()=id);
create policy "profile update own" on profiles for update using (auth.uid()=id);
create policy "verification insert" on seller_verifications for insert with check (true);
create policy "verification read own or admin" on seller_verifications for select using (auth.uid()=user_id or exists(select 1 from profiles where id=auth.uid() and role='admin'));
create policy "verification admin update" on seller_verifications for update using (exists(select 1 from profiles where id=auth.uid() and role='admin'));
create policy "enquiry insert" on enquiries for insert with check (true);
create policy "enquiry read related" on enquiries for select using (auth.uid()=buyer_id or exists(select 1 from products where products.id=enquiries.product_id and products.seller_id=auth.uid()) or exists(select 1 from profiles where id=auth.uid() and role='admin'));
create policy "plan order insert" on plan_orders for insert with check (true);
create policy "plan order read own or admin" on plan_orders for select using (auth.uid()=user_id or exists(select 1 from profiles where id=auth.uid() and role='admin'));

insert into storage.buckets (id, name, public) values ('seller-documents','seller-documents',true) on conflict (id) do nothing;

-- v10 additions: AI logs, payments, notifications, saved items, product images
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);
create table if not exists ai_chat_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  question text not null,
  answer text,
  created_at timestamptz default now()
);
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean default false,
  created_at timestamptz default now()
);
create table if not exists saved_products (
  user_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz default now(),
  primary key(user_id, product_id)
);
create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  plan_id text,
  amount numeric,
  gateway text default 'razorpay',
  gateway_payment_id text,
  status text default 'created',
  raw jsonb,
  created_at timestamptz default now()
);
alter table product_images enable row level security;
alter table ai_chat_logs enable row level security;
alter table notifications enable row level security;
alter table saved_products enable row level security;
alter table payment_events enable row level security;
create policy if not exists "public read product images" on product_images for select using (true);
create policy if not exists "seller manage product images" on product_images for all using (exists(select 1 from products where products.id=product_images.product_id and products.seller_id=auth.uid()));
create policy if not exists "user insert ai logs" on ai_chat_logs for insert with check (auth.uid()=user_id or user_id is null);
create policy if not exists "user read own notifications" on notifications for select using (auth.uid()=user_id or exists(select 1 from profiles where id=auth.uid() and role='admin'));
create policy if not exists "user update own notifications" on notifications for update using (auth.uid()=user_id);
create policy if not exists "user save products" on saved_products for all using (auth.uid()=user_id);
create policy if not exists "payment insert own" on payment_events for insert with check (auth.uid()=user_id or user_id is null);
create policy if not exists "payment read own or admin" on payment_events for select using (auth.uid()=user_id or exists(select 1 from profiles where id=auth.uid() and role='admin'));
