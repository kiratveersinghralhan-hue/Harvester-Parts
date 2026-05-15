-- Harvester Parts v76 non-destructive admin patch
-- Run this once in Supabase SQL Editor if you already ran the previous clean reset.
-- It adds Aadhaar back document storage, banned statuses, and safer admin workflow fields.

begin;

alter table public.sellers add column if not exists aadhaar_back text;
alter table public.sellers add column if not exists banned_at timestamptz;
alter table public.sellers add column if not exists ban_reason text;

alter table public.products add column if not exists rejection_reason text;
alter table public.products add column if not exists banned_at timestamptz;

alter table public.sellers drop constraint if exists sellers_status_check;
alter table public.sellers add constraint sellers_status_check
  check (status in ('pending', 'provisional', 'approved', 'rejected', 'banned'));

alter table public.sellers drop constraint if exists sellers_verification_status_check;
alter table public.sellers add constraint sellers_verification_status_check
  check (verification_status in ('pending', 'provisional', 'approved', 'rejected', 'banned'));

alter table public.products drop constraint if exists products_status_check;
alter table public.products add constraint products_status_check
  check (status in ('pending', 'approved', 'rejected', 'banned'));

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
      new.banned_at := null;
    else
      if old.status in ('approved', 'banned') then
        new.status := old.status;
        new.verification_status := old.verification_status;
        new.approved_at := old.approved_at;
        new.banned_at := old.banned_at;
        new.ban_reason := old.ban_reason;
      else
        new.status := 'pending';
        new.verification_status := 'pending';
        new.approved_at := null;
        new.banned_at := null;
      end if;
      new.user_id := old.user_id;
    end if;
  else
    if new.status = 'approved' and new.approved_at is null then
      new.approved_at := now();
    end if;
    if new.status = 'banned' and new.banned_at is null then
      new.banned_at := now();
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

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
      new.banned_at := null;
      new.seller_id := (select s.id from public.sellers s where s.user_id = new.user_id and s.status = 'approved' limit 1);
    else
      new.user_id := old.user_id;
      new.seller_id := old.seller_id;
      new.status := old.status;
      new.is_boosted := old.is_boosted;
      new.boost_until := old.boost_until;
      new.approved_at := old.approved_at;
      new.banned_at := old.banned_at;
    end if;
  else
    if new.status = 'approved' and new.approved_at is null then
      new.approved_at := now();
    end if;
    if new.status = 'banned' and new.banned_at is null then
      new.banned_at := now();
    end if;
    if new.seller_id is null then
      new.seller_id := (select s.id from public.sellers s where s.user_id = new.user_id limit 1);
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

commit;
