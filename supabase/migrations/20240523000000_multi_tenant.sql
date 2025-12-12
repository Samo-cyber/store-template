-- Create stores table
create table public.stores (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  owner_id uuid references auth.users(id),
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on stores
alter table public.stores enable row level security;

-- Policies for stores
create policy "Stores are viewable by everyone"
  on public.stores for select
  using ( true );

create policy "Users can create their own stores"
  on public.stores for insert
  with check ( auth.uid() = owner_id );

create policy "Users can update their own stores"
  on public.stores for update
  using ( auth.uid() = owner_id );

-- Add store_id to products
alter table public.products add column store_id uuid references public.stores(id);

-- Add store_id and shipping_cost to orders
alter table public.orders add column store_id uuid references public.stores(id);
alter table public.orders add column shipping_cost numeric default 0;
alter table public.orders alter column customer_email drop not null;

-- Update RLS for Products to check store ownership for write operations
create policy "Store owners can insert products"
  on public.products for insert
  with check (
    exists (
      select 1 from public.stores
      where id = store_id and owner_id = auth.uid()
    )
  );

create policy "Store owners can update products"
  on public.products for update
  using (
    exists (
      select 1 from public.stores
      where id = store_id and owner_id = auth.uid()
    )
  );

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
