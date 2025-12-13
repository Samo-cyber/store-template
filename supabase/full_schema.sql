-- Full Database Schema
-- Generated from migrations

-- 1. Multi Tenant Setup (20240523000000_multi_tenant.sql)
-- Create stores table
create table if not exists public.stores (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  owner_id uuid references public.users(id),
  settings jsonb default '{}'::jsonb,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on stores
alter table public.stores enable row level security;

-- Policies for stores
drop policy if exists "Stores are viewable by everyone" on public.stores;
create policy "Stores are viewable by everyone"
  on public.stores for select
  using ( true );

drop policy if exists "Users can create their own stores" on public.stores;
create policy "Users can create their own stores"
  on public.stores for insert
  with check ( auth.uid() = owner_id );

drop policy if exists "Users can update their own stores" on public.stores;
create policy "Users can update their own stores"
  on public.stores for update
  using ( auth.uid() = owner_id );

-- Add store_id to products
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'store_id') then
    alter table public.products add column store_id uuid references public.stores(id);
  end if;
end $$;

-- Add store_id and shipping_cost to orders
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'store_id') then
    alter table public.orders add column store_id uuid references public.stores(id);
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'shipping_cost') then
    alter table public.orders add column shipping_cost numeric default 0;
  end if;

  -- Handle customer_email
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'customer_email') then
    alter table public.orders add column customer_email text;
  else
    alter table public.orders alter column customer_email drop not null;
  end if;
end $$;

-- Update RLS for Products to check store ownership for write operations
drop policy if exists "Store owners can insert products" on public.products;
create policy "Store owners can insert products"
  on public.products for insert
  with check (
    exists (
      select 1 from public.stores
      where id = store_id and owner_id = auth.uid()
    )
  );

drop policy if exists "Store owners can update products" on public.products;
create policy "Store owners can update products"
  on public.products for update
  using (
    exists (
      select 1 from public.stores
      where id = store_id and owner_id = auth.uid()
    )
  );

drop policy if exists "Store owners can delete products" on public.products;
create policy "Store owners can delete products"
  on public.products for delete
  using (
    exists (
      select 1 from public.stores
      where id = store_id and owner_id = auth.uid()
    )
  );

-- Update create_order function to include store_id and shipping_cost
create or replace function create_order(
  p_store_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_address jsonb,
  p_total_amount numeric,
  p_items jsonb,
  p_shipping_cost numeric default 0,
  p_customer_email text default null
) returns uuid as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product_stock integer;
begin
  -- 1. Create Order
  insert into public.orders (store_id, customer_name, customer_email, customer_phone, address, total_amount, shipping_cost)
  values (p_store_id, p_customer_name, p_customer_email, p_customer_phone, p_address, p_total_amount, p_shipping_cost)
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


-- 2. Fix Analytics (20240523000001_fix_analytics.sql)
-- Drop existing functions (signatures might differ, so we use DROP FUNCTION IF EXISTS name)
DROP FUNCTION IF EXISTS get_dashboard_stats();
DROP FUNCTION IF EXISTS get_monthly_sales();
DROP FUNCTION IF EXISTS get_top_products();

-- Create get_dashboard_stats
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_store_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_revenue numeric;
  v_total_orders integer;
  v_total_products integer;
  v_low_stock_count integer;
BEGIN
  -- Total Revenue (sum of total_amount for completed orders)
  SELECT COALESCE(SUM(total_amount), 0)
  INTO v_total_revenue
  FROM orders
  WHERE store_id = p_store_id AND status != 'cancelled';

  -- Total Orders
  SELECT COUNT(*)
  INTO v_total_orders
  FROM orders
  WHERE store_id = p_store_id;

  -- Total Products
  SELECT COUNT(*)
  INTO v_total_products
  FROM products
  WHERE store_id = p_store_id;

  -- Low Stock Count (stock < 10)
  SELECT COUNT(*)
  INTO v_low_stock_count
  FROM products
  WHERE store_id = p_store_id AND stock < 10;

  RETURN json_build_object(
    'totalRevenue', v_total_revenue,
    'totalOrders', v_total_orders,
    'totalProducts', v_total_products,
    'lowStockCount', v_low_stock_count
  );
END;
$$;

-- Create get_monthly_sales
CREATE OR REPLACE FUNCTION get_monthly_sales(p_store_id uuid)
RETURNS TABLE (
  month text,
  revenue numeric,
  orders_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(created_at, 'YYYY-MM') as month,
    SUM(total_amount) as revenue,
    COUNT(*)::integer as orders_count
  FROM orders
  WHERE store_id = p_store_id AND status != 'cancelled'
  GROUP BY 1
  ORDER BY 1 DESC
  LIMIT 12;
END;
$$;

-- Create get_top_products
CREATE OR REPLACE FUNCTION get_top_products(p_store_id uuid)
RETURNS TABLE (
  product_id uuid,
  product_title text,
  product_image text,
  total_sold integer,
  total_revenue numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as product_id,
    p.title as product_title,
    p.image_url as product_image,
    SUM(oi.quantity)::integer as total_sold,
    SUM(oi.quantity * oi.price_at_purchase) as total_revenue
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  JOIN products p ON oi.product_id = p.id
  WHERE o.store_id = p_store_id AND o.status != 'cancelled'
  GROUP BY p.id, p.title, p.image_url
  ORDER BY total_sold DESC
  LIMIT 5;
END;
$$;


-- 3. Platform Upgrade (20240523000002_platform_upgrade.sql)
-- Create users table (Custom Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('super_admin', 'store_owner', 'user')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Public users are viewable by everyone"
  ON public.users FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK ( true ); -- Allow public registration

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING ( true ); -- Simplified for custom auth, logic handled in API

-- Trigger to handle new user creation (REMOVED - Custom Auth handles this)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- RPC: Get Platform Stats (Super Admin)
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_total_stores integer;
  v_total_users integer;
  v_total_revenue numeric;
BEGIN
  -- Total Stores
  SELECT COUNT(*) INTO v_total_stores FROM stores;

  -- Total Users
  SELECT COUNT(*) INTO v_total_users FROM users;

  -- Total Platform Revenue (sum of all orders)
  SELECT COALESCE(SUM(total_amount), 0) INTO v_total_revenue FROM orders WHERE status != 'cancelled';

  RETURN json_build_object(
    'totalStores', v_total_stores,
    'totalUsers', v_total_users,
    'totalRevenue', v_total_revenue
  );
END;
$$;

-- RPC: Get All Stores Analytics (Super Admin)
CREATE OR REPLACE FUNCTION get_all_stores_analytics()
RETURNS TABLE (
  store_id uuid,
  store_name text,
  store_slug text,
  owner_email text,
  total_revenue numeric,
  total_orders integer,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id as store_id,
    s.name as store_name,
    s.slug as store_slug,
    p.email as owner_email,
    COALESCE(SUM(o.total_amount) FILTER (WHERE o.status != 'cancelled'), 0) as total_revenue,
    COUNT(o.id)::integer as total_orders,
    s.created_at
  FROM stores s
  LEFT JOIN users p ON s.owner_id = p.id
  LEFT JOIN orders o ON s.id = o.store_id
  GROUP BY s.id, s.name, s.slug, p.email, s.created_at
  ORDER BY total_revenue DESC;
END;
$$;


-- 4. Secure Orders (20240523000003_secure_orders.sql)
-- Enable RLS on orders and order_items
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Store owners can view orders for their stores
DROP POLICY IF EXISTS "Store owners can view their orders" ON public.orders;
CREATE POLICY "Store owners can view their orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE id = store_id AND owner_id = auth.uid()
    )
  );

-- Policy: Store owners can view order items for their orders
DROP POLICY IF EXISTS "Store owners can view their order items" ON public.order_items;
CREATE POLICY "Store owners can view their order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      JOIN public.stores ON orders.store_id = stores.id
      WHERE orders.id = order_items.order_id AND stores.owner_id = auth.uid()
    )
  );

-- Update RPC functions to check for ownership
-- We use a helper check to avoid code duplication, or just inline it.

-- 1. get_dashboard_stats
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_store_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_revenue numeric;
  v_total_orders integer;
  v_total_products integer;
  v_low_stock_count integer;
BEGIN
  -- Security Check
  IF NOT EXISTS (SELECT 1 FROM public.stores WHERE id = p_store_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized Access';
  END IF;

  -- Total Revenue (sum of total_amount for completed orders)
  SELECT COALESCE(SUM(total_amount), 0)
  INTO v_total_revenue
  FROM orders
  WHERE store_id = p_store_id AND status != 'cancelled';

  -- Total Orders
  SELECT COUNT(*)
  INTO v_total_orders
  FROM orders
  WHERE store_id = p_store_id;

  -- Total Products
  SELECT COUNT(*)
  INTO v_total_products
  FROM products
  WHERE store_id = p_store_id;

  -- Low Stock Count (stock < 10)
  SELECT COUNT(*)
  INTO v_low_stock_count
  FROM products
  WHERE store_id = p_store_id AND stock < 10;

  RETURN json_build_object(
    'totalRevenue', v_total_revenue,
    'totalOrders', v_total_orders,
    'totalProducts', v_total_products,
    'lowStockCount', v_low_stock_count
  );
END;
$$;

-- 2. get_monthly_sales
CREATE OR REPLACE FUNCTION get_monthly_sales(p_store_id uuid)
RETURNS TABLE (
  month text,
  revenue numeric,
  orders_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Security Check
  IF NOT EXISTS (SELECT 1 FROM public.stores WHERE id = p_store_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized Access';
  END IF;

  RETURN QUERY
  SELECT
    to_char(created_at, 'YYYY-MM') as month,
    SUM(total_amount) as revenue,
    COUNT(*)::integer as orders_count
  FROM orders
  WHERE store_id = p_store_id AND status != 'cancelled'
  GROUP BY 1
  ORDER BY 1 DESC
  LIMIT 12;
END;
$$;

-- 3. get_top_products
CREATE OR REPLACE FUNCTION get_top_products(p_store_id uuid)
RETURNS TABLE (
  product_id uuid,
  product_title text,
  product_image text,
  total_sold integer,
  total_revenue numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Security Check
  IF NOT EXISTS (SELECT 1 FROM public.stores WHERE id = p_store_id AND owner_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized Access';
  END IF;

  RETURN QUERY
  SELECT
    p.id as product_id,
    p.title as product_title,
    p.image_url as product_image,
    SUM(oi.quantity)::integer as total_sold,
    SUM(oi.quantity * oi.price_at_purchase) as total_revenue
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  JOIN products p ON oi.product_id = p.id
  WHERE o.store_id = p_store_id AND o.status != 'cancelled'
  GROUP BY p.id, p.title, p.image_url
  ORDER BY total_sold DESC
  LIMIT 5;
END;
$$;


-- 5. Add Template Column (20240523000004_add_template_column.sql)
-- Add template column to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS template text DEFAULT 'modern';

-- Update existing stores to have 'modern' template
UPDATE public.stores SET template = 'modern' WHERE template IS NULL;
