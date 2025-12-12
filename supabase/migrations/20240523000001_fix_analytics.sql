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
