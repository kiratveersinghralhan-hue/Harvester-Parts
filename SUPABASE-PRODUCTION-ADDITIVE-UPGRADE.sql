-- Harvester Parts production-safe additive upgrade
-- Date: 2026-08-19
-- Purpose: SEO/listing data fields + Request a Part workflow.
-- Safe rules:
--   - No DROP
--   - No DELETE
--   - No TRUNCATE
--   - No auth user changes
--   - No storage object changes
-- Run this only after taking a Supabase backup.

begin;

alter table public.products add column if not exists part_number text;
alter table public.products add column if not exists oem_number text;
alter table public.products add column if not exists sku_code text;
alter table public.products add column if not exists manufacturer text;
alter table public.products add column if not exists compatible_machine text;
alter table public.products add column if not exists compatible_model text;
alter table public.products add column if not exists compatible_years text;
alter table public.products add column if not exists origin_type text;
alter table public.products add column if not exists quantity_available numeric(14,2);
alter table public.products add column if not exists sale_unit text;
alter table public.products add column if not exists gst_invoice_available boolean;
alter table public.products add column if not exists dispatch_time text;
alter table public.products add column if not exists warranty text;
alter table public.products add column if not exists dimensions jsonb not null default '{}'::jsonb;

create index if not exists products_brand_model_idx on public.products(brand, model);
create index if not exists products_part_number_idx on public.products(part_number);
create index if not exists products_oem_number_idx on public.products(oem_number);
create index if not exists products_sale_unit_idx on public.products(sale_unit);

create table if not exists public.part_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(auth_id) on delete cascade,
  buyer_email text not null default '',
  buyer_name text not null default '',
  machine_type text not null default '',
  brand text not null default '',
  model text not null default '',
  part_name text not null,
  part_number text not null default '',
  condition_preference text not null default 'Any condition',
  location text not null default '',
  description text not null default '',
  photo_url text not null default '',
  status text not null default 'open',
  admin_note text not null default '',
  matched_product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists part_requests_user_created_idx on public.part_requests(user_id, created_at desc);
create index if not exists part_requests_status_created_idx on public.part_requests(status, created_at desc);
create index if not exists part_requests_lookup_idx on public.part_requests(machine_type, brand, model, part_number);

alter table public.part_requests enable row level security;

grant select, insert, update on public.part_requests to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'part_requests'
      and policyname = 'part_requests_owner_or_admin_select'
  ) then
    execute 'create policy part_requests_owner_or_admin_select on public.part_requests for select to authenticated using (user_id = auth.uid() or public.is_hp_admin())';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'part_requests'
      and policyname = 'part_requests_owner_insert'
  ) then
    execute 'create policy part_requests_owner_insert on public.part_requests for insert to authenticated with check (user_id = auth.uid() or public.is_hp_admin())';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'part_requests'
      and policyname = 'part_requests_owner_or_admin_update'
  ) then
    execute 'create policy part_requests_owner_or_admin_update on public.part_requests for update to authenticated using (user_id = auth.uid() or public.is_hp_admin()) with check (user_id = auth.uid() or public.is_hp_admin())';
  end if;
end $$;

do $$
begin
  begin
    alter publication supabase_realtime add table public.part_requests;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end $$;

commit;

select
  'part_requests_table' as check_name,
  case when exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'part_requests'
  ) then 'OK' else 'MISSING' end as status
union all
select
  'product_additive_columns',
  case when (
    select count(*) from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name in (
        'part_number','oem_number','sku_code','manufacturer','compatible_machine',
        'compatible_model','compatible_years','origin_type','quantity_available',
        'sale_unit','gst_invoice_available','dispatch_time','warranty','dimensions'
      )
  ) = 14 then 'OK' else 'MISSING' end;
