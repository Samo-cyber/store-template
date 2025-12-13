-- Enable RLS on products (ensure it's enabled)
alter table public.products enable row level security;

-- Policy: Products are viewable by everyone
drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Products are viewable by everyone"
  on public.products for select
  using ( true );
