-- ==========================================
-- 1. Extensions & Cleanup
-- ==========================================
create extension if not exists "uuid-ossp";

-- Drop existing objects to ensure a clean slate (Optional, be careful in production)
-- drop table if exists public.order_items;
-- drop table if exists public.orders;
-- drop table if exists public.products;
-- drop function if exists create_order;

-- ==========================================
-- 2. Tables
-- ==========================================

-- Products Table
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price numeric not null,
  category text not null,
  image_url text not null,
  stock integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders Table (Removed customer_email)
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  customer_phone text not null,
  address jsonb not null,
  total_amount numeric not null,
  status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items Table
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null,
  price_at_purchase numeric not null
);

-- ==========================================
-- 3. Row Level Security (RLS) & Policies
-- ==========================================

-- Enable RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Products Policies
drop policy if exists "Public products are viewable by everyone" on public.products;
create policy "Public products are viewable by everyone"
  on public.products for select
  using ( true );

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
  on public.products for all
  using ( auth.role() = 'authenticated' );

-- Orders Policies
drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders"
  on public.orders for select
  using ( auth.role() = 'authenticated' );

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders for update
  using ( auth.role() = 'authenticated' );

-- Order Items Policies
drop policy if exists "Admins can view order items" on public.order_items;
create policy "Admins can view order items"
  on public.order_items for select
  using ( auth.role() = 'authenticated' );

-- ==========================================
-- 4. Functions (RPC)
-- ==========================================

-- Function to create order and order items transactionally (Removed email)
create or replace function create_order(
  p_customer_name text,
  p_customer_phone text,
  p_address jsonb,
  p_total_amount numeric,
  p_items jsonb
) returns uuid as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product_stock integer;
begin
  -- 1. Create Order
  insert into public.orders (customer_name, customer_phone, address, total_amount)
  values (p_customer_name, p_customer_phone, p_address, p_total_amount)
  returning id into v_order_id;

  -- 2. Process Items
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    -- Check stock
    select stock into v_product_stock from public.products where id = (v_item->>'id')::uuid;
    
    if v_product_stock < (v_item->>'quantity')::integer then
      raise exception 'Insufficient stock for product %', (v_item->>'id');
    end if;

    -- Insert Order Item
    insert into public.order_items (order_id, product_id, quantity, price_at_purchase)
    values (
      v_order_id,
      (v_item->>'id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'price')::numeric
    );

    -- Update Stock
    update public.products
    set stock = stock - (v_item->>'quantity')::integer
    where id = (v_item->>'id')::uuid;
  end loop;

  return v_order_id;
end;
$$ language plpgsql security definer;

-- ==========================================
-- 5. Storage
-- ==========================================

-- Create bucket if not exists (This usually needs to be done via API or UI, but SQL works in some environments)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Storage Policies
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'products' );

drop policy if exists "Authenticated Upload" on storage.objects;
create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'products' and auth.role() = 'authenticated' );
