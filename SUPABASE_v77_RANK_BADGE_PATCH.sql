-- Harvester Parts v77 non-destructive rank, badge, banner and event patch
-- Run this after v76. It keeps all existing users, sellers, products and orders.

begin;

alter table public.users add column if not exists points integer not null default 0 check (points >= 0);
alter table public.users add column if not exists rank_key text not null default 'starter';
alter table public.users add column if not exists rank_title text not null default 'Farm Starter';
alter table public.users add column if not exists badge_key text not null default 'buyer_member';
alter table public.users add column if not exists banner_key text not null default 'starter';
alter table public.users add column if not exists banner_title text not null default 'Starter Banner';
alter table public.users add column if not exists title_prefix text;
alter table public.users add column if not exists is_founder boolean not null default false;
alter table public.users add column if not exists founder_number integer;

create table if not exists public.badge_collections (
  collection_key text primary key,
  title text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.badge_definitions (
  badge_key text primary key,
  collection_key text references public.badge_collections(collection_key) on delete set null,
  badge_name text not null,
  badge_title text not null,
  badge_tier text not null default 'base',
  badge_shape text not null default 'custom-card',
  banner_title text,
  criteria text,
  is_unique boolean not null default false,
  max_holders integer,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(auth_id) on delete cascade,
  badge_key text not null references public.badge_definitions(badge_key) on delete cascade,
  awarded_by uuid references public.users(auth_id) on delete set null,
  reason text,
  is_featured boolean not null default false,
  awarded_at timestamptz not null default now(),
  unique(user_id, badge_key)
);

create unique index if not exists one_founder_badge_holder
on public.user_badges (badge_key)
where badge_key = 'founder_1_of_1';

create table if not exists public.rank_rules (
  rank_key text primary key,
  rank_title text not null,
  min_points integer not null default 0,
  banner_title text not null,
  custom_style text default 'standard',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_events (
  id uuid primary key default gen_random_uuid(),
  event_key text unique,
  title text not null,
  description text,
  metric_key text not null default 'approved_listings',
  reward_badge_key text references public.badge_definitions(badge_key) on delete set null,
  reward_title text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft' check (status in ('draft','scheduled','live','ended','cancelled')),
  created_by uuid references public.users(auth_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_scores (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.platform_events(id) on delete cascade,
  user_id uuid not null references public.users(auth_id) on delete cascade,
  score numeric(12,2) not null default 0,
  rank_position integer,
  updated_at timestamptz not null default now(),
  unique(event_id, user_id)
);

insert into public.badge_collections(collection_key,title,description,sort_order) values
('founder_series','Founder Series','One-of-one founder/admin identity badges and banners.',1),
('seller_growth','Seller Growth','Badges for listing, approval and trusted seller activity.',2),
('buyer_trust','Buyer Trust','Badges for buyer and profile progress.',3),
('event_rewards','Event Rewards','Limited event badges for future challenges and campaigns.',4)
on conflict (collection_key) do update set title=excluded.title, description=excluded.description, sort_order=excluded.sort_order;

insert into public.badge_definitions(badge_key,collection_key,badge_name,badge_title,badge_tier,badge_shape,banner_title,criteria,is_unique,max_holders,sort_order) values
('founder_1_of_1','founder_series','Founder 1 of 1','Platform Founder','founder','custom-no-icon','Original Founder Banner','Reserved only for kiratveersinghralhan@gmail.com',true,1,1),
('admin_crown','founder_series','Admin Control','Admin Authority','admin','custom-no-icon','Admin Control Banner','Admin role account',false,null,2),
('buyer_member','buyer_trust','Buyer Member','Market Member','base','custom-no-icon','Starter Banner','Account created',false,null,10),
('verified_seller','seller_growth','Verified Seller','Trusted Seller','green','custom-no-icon','Verified Seller Banner','Seller documents approved by admin',false,null,20),
('first_listing','seller_growth','First Listing','Marketplace Starter','bronze','custom-no-icon','First Listing Banner','User posts first product',false,null,30),
('growth_seller','seller_growth','Growth Seller','Listing Builder','silver','custom-no-icon','Growth Seller Banner','User posts multiple products',false,null,40),
('trusted_dealer','seller_growth','Trusted Dealer','Dealer Rank','gold','custom-no-icon','Trusted Dealer Banner','High approved listing activity',false,null,50),
('event_champion','event_rewards','Event Champion','Campaign Winner','event','custom-no-icon','Event Winner Banner','Awarded by admin after an event',false,null,60)
on conflict (badge_key) do update set
collection_key=excluded.collection_key,badge_name=excluded.badge_name,badge_title=excluded.badge_title,badge_tier=excluded.badge_tier,badge_shape=excluded.badge_shape,banner_title=excluded.banner_title,criteria=excluded.criteria,is_unique=excluded.is_unique,max_holders=excluded.max_holders,sort_order=excluded.sort_order,active=true;

insert into public.rank_rules(rank_key,rank_title,min_points,banner_title,custom_style,sort_order) values
('starter','Farm Starter',0,'Starter Banner','standard',1),
('rising','Rising Trader',120,'Rising Trader Banner','green',2),
('trusted','Trusted Dealer',400,'Trusted Dealer Banner','blue',3),
('pro','Pro Seller',900,'Pro Seller Banner','pro',4),
('elite','Elite Harvester Seller',1800,'Elite Seller Banner','gold',5),
('legend','Marketplace Legend',3500,'Legend Banner','legend',6),
('founder','Founder 1 of 1',999999,'Original Founder Banner','founder',7)
on conflict (rank_key) do update set rank_title=excluded.rank_title,min_points=excluded.min_points,banner_title=excluded.banner_title,custom_style=excluded.custom_style,sort_order=excluded.sort_order,active=true;

insert into public.platform_events(event_key,title,description,metric_key,reward_badge_key,reward_title,status) values
('listing_sprint','Listing Sprint','Future event: highest approved listings can win a custom badge, title and banner.','approved_listings','event_champion','Listing Sprint Champion','draft'),
('dealer_week','Dealer Week','Future event: top seller/dealer challenge with limited event reward.','seller_points','event_champion','Dealer Week Winner','draft'),
('harvest_festival_rewards','Harvest Festival Rewards','Future seasonal reward event for top activity.','total_activity','event_champion','Harvest Festival Winner','draft')
on conflict (event_key) do update set title=excluded.title,description=excluded.description,metric_key=excluded.metric_key,reward_badge_key=excluded.reward_badge_key,reward_title=excluded.reward_title;

update public.users
set role='admin',
    points=999999,
    rank_key='founder',
    rank_title='Founder 1 of 1',
    badge_key='founder_1_of_1',
    badge_title='Founder 1 of 1',
    badge_color='gold',
    banner_key='founder_1_of_1',
    banner_title='Original Founder • One of One',
    title_prefix='Platform Founder',
    is_founder=true,
    founder_number=1,
    updated_at=now()
where lower(email)='kiratveersinghralhan@gmail.com';

insert into public.user_badges(user_id,badge_key,reason,is_featured)
select auth_id,'founder_1_of_1','Original platform founder one-of-one badge',true
from public.users
where lower(email)='kiratveersinghralhan@gmail.com'
on conflict do nothing;

insert into public.user_badges(user_id,badge_key,reason,is_featured)
select auth_id,'admin_crown','Admin control badge',false
from public.users
where lower(email)='kiratveersinghralhan@gmail.com'
on conflict do nothing;

alter table public.badge_collections enable row level security;
alter table public.badge_definitions enable row level security;
alter table public.user_badges enable row level security;
alter table public.rank_rules enable row level security;
alter table public.platform_events enable row level security;
alter table public.event_scores enable row level security;

-- Clean existing policies so patch can be rerun safely.
drop policy if exists "badge collections readable" on public.badge_collections;
drop policy if exists "badge collections admin manage" on public.badge_collections;
drop policy if exists "badge definitions readable" on public.badge_definitions;
drop policy if exists "badge definitions admin manage" on public.badge_definitions;
drop policy if exists "user badges readable" on public.user_badges;
drop policy if exists "user badges admin manage" on public.user_badges;
drop policy if exists "rank rules readable" on public.rank_rules;
drop policy if exists "rank rules admin manage" on public.rank_rules;
drop policy if exists "events readable" on public.platform_events;
drop policy if exists "events admin manage" on public.platform_events;
drop policy if exists "event scores readable" on public.event_scores;
drop policy if exists "event scores admin manage" on public.event_scores;

create policy "badge collections readable" on public.badge_collections for select using (true);
create policy "badge collections admin manage" on public.badge_collections for all using (public.is_admin()) with check (public.is_admin());

create policy "badge definitions readable" on public.badge_definitions for select using (active = true or public.is_admin());
create policy "badge definitions admin manage" on public.badge_definitions for all using (public.is_admin()) with check (public.is_admin());

create policy "user badges readable" on public.user_badges for select using (true);
create policy "user badges admin manage" on public.user_badges for all using (public.is_admin()) with check (public.is_admin());

create policy "rank rules readable" on public.rank_rules for select using (active = true or public.is_admin());
create policy "rank rules admin manage" on public.rank_rules for all using (public.is_admin()) with check (public.is_admin());

create policy "events readable" on public.platform_events for select using (status in ('scheduled','live','ended','draft') or public.is_admin());
create policy "events admin manage" on public.platform_events for all using (public.is_admin()) with check (public.is_admin());

create policy "event scores readable" on public.event_scores for select using (true);
create policy "event scores admin manage" on public.event_scores for all using (public.is_admin()) with check (public.is_admin());

grant select on public.badge_collections, public.badge_definitions, public.rank_rules, public.platform_events, public.event_scores, public.user_badges to anon, authenticated;
grant insert, update, delete on public.badge_collections, public.badge_definitions, public.rank_rules, public.platform_events, public.event_scores, public.user_badges to authenticated;

commit;
