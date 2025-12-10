-- 1. Orders Table Policies
alter table orders enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Enable read access for authenticated users only" on orders;
drop policy if exists "Enable update for authenticated users only" on orders;

-- Allow admins (authenticated users) to view all orders
create policy "Enable read access for authenticated users only"
  on orders for select
  using ( auth.role() = 'authenticated' );

-- Allow admins to update order status
create policy "Enable update for authenticated users only"
  on orders for update
  using ( auth.role() = 'authenticated' );

-- 2. Order Items Table Policies
alter table order_items enable row level security;

drop policy if exists "Enable read access for authenticated users only" on order_items;

-- Allow admins to view order items
create policy "Enable read access for authenticated users only"
  on order_items for select
  using ( auth.role() = 'authenticated' );
