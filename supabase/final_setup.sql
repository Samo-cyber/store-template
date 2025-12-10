-- ==========================================
-- FINAL SETUP SCRIPT (v5)
-- This script consolidates all changes:
-- 1. Adds 'stock' column to products.
-- 2. Removes 'customer_email' from orders.
-- 3. Adds 'shipping_rates' table.
-- 4. Adds 'settings' table.
-- 5. Adds 'shipping_cost' to orders.
-- 6. Updates 'create_order' function.
-- 7. Sets up RLS policies and Storage.
-- 8. Adds Analytics RPC functions.
-- ==========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. Table Updates (Safe Migrations)
-- ==========================================

-- Products Table: Ensure 'stock' column exists
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

-- Add 'stock' column if it was missing (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN
        ALTER TABLE public.products ADD COLUMN stock integer DEFAULT 0;
    END IF;
END $$;

-- Update existing products to have stock (avoid "Out of Stock" for existing items)
UPDATE public.products SET stock = 10 WHERE stock IS NULL OR stock = 0;

-- Orders Table: Ensure 'customer_email' is removed and 'shipping_cost' is added
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  customer_phone text not null,
  address jsonb not null,
  total_amount numeric not null,
  shipping_cost numeric default 0,
  status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Drop 'customer_email' if it still exists
ALTER TABLE public.orders DROP COLUMN IF EXISTS customer_email;

-- Add 'shipping_cost' if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_cost') THEN
        ALTER TABLE public.orders ADD COLUMN shipping_cost numeric DEFAULT 0;
    END IF;
END $$;

-- Order Items Table
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null,
  price_at_purchase numeric not null
);

-- Shipping Rates Table
create table if not exists public.shipping_rates (
  id uuid default uuid_generate_v4() primary key,
  governorate text not null unique,
  price numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default shipping rates if empty
insert into public.shipping_rates (governorate, price)
values 
  ('القاهرة', 50),
  ('الجيزة', 50),
  ('الإسكندرية', 60),
  ('أخرى', 70)
on conflict (governorate) do nothing;

-- Settings Table (New)
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default settings
insert into public.settings (key, value)
values 
  ('free_shipping', '{"isActive": false, "endDate": null}'::jsonb)
on conflict (key) do nothing;

-- ==========================================
-- 2. Row Level Security (RLS) & Policies
-- ==========================================

-- Enable RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.settings enable row level security;

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

-- Shipping Rates Policies
drop policy if exists "Public view shipping rates" on public.shipping_rates;
create policy "Public view shipping rates"
  on public.shipping_rates for select
  using ( true );

drop policy if exists "Admins can manage shipping rates" on public.shipping_rates;
create policy "Admins can manage shipping rates"
  on public.shipping_rates for all
  using ( auth.role() = 'authenticated' );

-- Settings Policies
drop policy if exists "Public view settings" on public.settings;
create policy "Public view settings"
  on public.settings for select
  using ( true );

drop policy if exists "Admins can manage settings" on public.settings;
create policy "Admins can manage settings"
  on public.settings for all
  using ( auth.role() = 'authenticated' );

-- ==========================================
-- 3. Functions (RPC)
-- ==========================================

-- Drop old function signature if it exists
DROP FUNCTION IF EXISTS create_order(text, text, text, jsonb, numeric, jsonb);
DROP FUNCTION IF EXISTS create_order(text, text, jsonb, numeric, jsonb);

-- Function to create order and order items transactionally (With shipping cost)
create or replace function create_order(
  p_customer_name text,
  p_customer_phone text,
  p_address jsonb,
  p_total_amount numeric,
  p_items jsonb,
  p_shipping_cost numeric default 0
) returns uuid as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product_stock integer;
begin
  -- 1. Create Order
  insert into public.orders (customer_name, customer_phone, address, total_amount, shipping_cost)
  values (p_customer_name, p_customer_phone, p_address, p_total_amount, p_shipping_cost)
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

-- Analytics Functions

-- 1. Get Monthly Sales
create or replace function get_monthly_sales()
returns table (
  month text,
  revenue numeric,
  orders_count bigint
) as $$
begin
  return query
  select
    to_char(created_at, 'YYYY-MM') as month,
    sum(total_amount) as revenue,
    count(*) as orders_count
  from public.orders
  group by 1
  order by 1 desc
  limit 12;
end;
$$ language plpgsql security definer;

-- 2. Get Top Products
create or replace function get_top_products()
returns table (
  product_id uuid,
  product_title text,
  product_image text,
  total_sold bigint,
  total_revenue numeric
) as $$
begin
  return query
  select
    p.id,
    p.title,
    p.image_url,
    sum(oi.quantity) as total_sold,
    sum(oi.quantity * oi.price_at_purchase) as total_revenue
  from public.order_items oi
  join public.products p on p.id = oi.product_id
  group by p.id, p.title, p.image_url
  order by total_sold desc
  limit 5;
end;
$$ language plpgsql security definer;

-- 3. Get Dashboard Stats
create or replace function get_dashboard_stats()
returns jsonb as $$
declare
  v_total_revenue numeric;
  v_total_orders bigint;
  v_total_products bigint;
  v_low_stock_count bigint;
begin
  select coalesce(sum(total_amount), 0), count(*)
  into v_total_revenue, v_total_orders
  from public.orders;

  select count(*)
  into v_total_products
  from public.products;

  select count(*)
  into v_low_stock_count
  from public.products
  where stock < 5;

  return jsonb_build_object(
    'totalRevenue', v_total_revenue,
    'totalOrders', v_total_orders,
    'totalProducts', v_total_products,
    'lowStockCount', v_low_stock_count
  );
end;
$$ language plpgsql security definer;

-- ==========================================
-- 4. Storage
-- ==========================================

-- Create bucket if not exists
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
