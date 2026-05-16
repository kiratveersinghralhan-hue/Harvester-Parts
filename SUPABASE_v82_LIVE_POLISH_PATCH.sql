-- Harvester Parts v82 non-destructive live content/admin identity patch
-- Run once in Supabase SQL Editor. Keeps all existing users, sellers, products, orders and payouts.

create extension if not exists pgcrypto;

alter table public.users add column if not exists title_prefix text;
alter table public.users add column if not exists banner_key text not null default 'starter';
alter table public.users add column if not exists banner_title text not null default 'Starter Banner';
alter table public.users add column if not exists badge_key text not null default 'buyer_member';
alter table public.users add column if not exists badge_title text not null default 'Buyer Member';
alter table public.users add column if not exists rank_key text not null default 'starter';
alter table public.users add column if not exists rank_title text not null default 'Farm Starter';
alter table public.users add column if not exists active_membership text;
alter table public.users add column if not exists membership_key text;
alter table public.users add column if not exists membership_title text;
alter table public.users add column if not exists membership_badge text;
alter table public.users add column if not exists membership_banner text;
alter table public.users add column if not exists membership_expires_at timestamptz;
alter table public.users add column if not exists is_founder boolean not null default false;
alter table public.users add column if not exists founder_number integer;
alter table public.users add column if not exists points integer not null default 0;


create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where auth_id = auth.uid()
      and (role = 'admin' or lower(email) = 'kiratveersinghralhan@gmail.com')
  );
$$;

create table if not exists public.site_carousel_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null,
  image_url text,
  cta_text text not null default 'Open',
  cta_route text not null default 'market',
  sort_order integer not null default 10,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_carousel_slides enable row level security;

drop policy if exists "carousel readable" on public.site_carousel_slides;
drop policy if exists "carousel admin manage" on public.site_carousel_slides;

create policy "carousel readable" on public.site_carousel_slides
for select using (active = true or public.is_admin());

create policy "carousel admin manage" on public.site_carousel_slides
for all using (public.is_admin()) with check (public.is_admin());

grant select on public.site_carousel_slides to anon, authenticated;
grant insert, update, delete on public.site_carousel_slides to authenticated;

insert into public.site_carousel_slides(title, subtitle, image_url, cta_text, cta_route, sort_order, active)
values
('Verified machinery and spare parts','Buy harvesters, tractors, implements and genuine agricultural spares from approved sellers.','https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80','Browse Marketplace','market',1,true),
('Sell with admin approval','Post your stock, build trust, earn ranks and receive seller payouts after platform commission.','https://images.unsplash.com/photo-1598514982195-f36b96d1e8d4?auto=format&fit=crop&w=1200&q=80','Start Selling','sell',2,true),
('Plans that reduce platform fees','Free sellers get 5 listings. Paid plans unlock more listings, rewards, boosts and lower seller commission.','https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80','View Plans','membership',3,true)
on conflict do nothing;

update public.users
set
  role = 'admin',
  is_founder = true,
  founder_number = 1,
  points = 999999,
  rank_key = 'founder',
  rank_title = 'Founder 1 of 1',
  badge_key = 'founder_1_of_1',
  badge_title = 'Founder 1 of 1',
  banner_key = 'founder_1_of_1',
  banner_title = 'Original Founder • One of One',
  title_prefix = 'Platform Founder',
  active_membership = 'admin_unlimited',
  membership_key = 'admin_unlimited',
  membership_title = 'Platform Founder',
  membership_badge = 'Founder 1 of 1',
  membership_banner = 'Original Founder • One of One',
  membership_expires_at = now() + interval '10 years'
where lower(email) = 'kiratveersinghralhan@gmail.com';

notify pgrst, 'reload schema';
