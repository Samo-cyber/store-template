-- 1. Create the storage bucket for products if it doesn't exist
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- 2. Storage Policies (Drop existing first to avoid conflicts)
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Upload" on storage.objects;
drop policy if exists "Authenticated Update" on storage.objects;
drop policy if exists "Authenticated Delete" on storage.objects;

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

-- 3. Products Table Policies
alter table products enable row level security;

-- Drop existing policies to ensure clean slate
drop policy if exists "Enable read access for all users" on products;
drop policy if exists "Enable insert for authenticated users only" on products;
drop policy if exists "Enable update for authenticated users only" on products;
drop policy if exists "Enable delete for authenticated users only" on products;

-- Re-create policies
create policy "Enable read access for all users"
  on products for select
  using ( true );

create policy "Enable insert for authenticated users only"
  on products for insert
  with check ( auth.role() = 'authenticated' );

create policy "Enable update for authenticated users only"
  on products for update
  using ( auth.role() = 'authenticated' );

create policy "Enable delete for authenticated users only"
  on products for delete
  using ( auth.role() = 'authenticated' );
