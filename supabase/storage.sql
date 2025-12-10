-- Create a storage bucket for products
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Set up access policies for the products bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'products' );

create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

create policy "Authenticated Update"
  on storage.objects for update
  with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

create policy "Authenticated Delete"
  on storage.objects for delete
  using ( bucket_id = 'products' and auth.role() = 'authenticated' );
