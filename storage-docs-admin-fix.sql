-- Optional repair if Aadhaar/shop document buttons do not open.
-- Safe: does not delete data.
insert into storage.buckets (id, name, public)
values
('verification-docs','verification-docs',false),
('product-images','product-images',true),
('profile-images','profile-images',true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "hp verification docs upload" on storage.objects;
drop policy if exists "hp verification docs read" on storage.objects;
drop policy if exists "hp verification docs update" on storage.objects;

create policy "hp verification docs upload"
on storage.objects for insert to authenticated
with check (bucket_id='verification-docs' and auth.uid() is not null);

create policy "hp verification docs read"
on storage.objects for select to authenticated
using (bucket_id='verification-docs' and (public.is_admin() or (storage.foldername(name))[2]=auth.uid()::text or owner = auth.uid()));

create policy "hp verification docs update"
on storage.objects for update to authenticated
using (bucket_id='verification-docs' and (public.is_admin() or owner = auth.uid()))
with check (bucket_id='verification-docs' and (public.is_admin() or owner = auth.uid()));
