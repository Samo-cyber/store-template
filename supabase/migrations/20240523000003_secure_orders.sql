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
