-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products Table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price numeric not null,
  category text not null,
  image_url text not null,
  stock integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders Table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  address jsonb not null,
  total_amount numeric not null,
  status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items Table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null,
  price_at_purchase numeric not null
);

-- Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Policies
-- Allow public read access to products
create policy "Public products are viewable by everyone"
  on public.products for select
  using ( true );

-- Allow anyone to create an order (for guest checkout)
create policy "Anyone can create an order"
  on public.orders for insert
  with check ( true );

-- Allow anyone to create order items
create policy "Anyone can create order items"
  on public.order_items for insert
  with check ( true );

-- Function to create order and order items transactionally
create or replace function create_order(
  p_customer_name text,
  p_customer_email text,
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
  insert into public.orders (customer_name, customer_email, customer_phone, address, total_amount)
  values (p_customer_name, p_customer_email, p_customer_phone, p_address, p_total_amount)
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
