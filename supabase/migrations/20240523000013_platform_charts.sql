-- RPC: Get Platform Monthly Revenue (Last 12 Months)
CREATE OR REPLACE FUNCTION get_platform_monthly_revenue()
RETURNS TABLE (
  month text,
  revenue numeric
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT to_char(date_trunc('month', d), 'YYYY-MM') as m
    FROM generate_series(
      date_trunc('month', now()) - interval '11 months',
      date_trunc('month', now()),
      interval '1 month'
    ) d
  ),
  monthly_data AS (
    SELECT
      to_char(date_trunc('month', created_at), 'YYYY-MM') as m,
      SUM(total_amount) as total
    FROM orders
    WHERE status != 'cancelled'
    AND created_at >= date_trunc('month', now()) - interval '11 months'
    GROUP BY 1
  )
  SELECT
    months.m,
    COALESCE(monthly_data.total, 0)
  FROM months
  LEFT JOIN monthly_data ON months.m = monthly_data.m
  ORDER BY months.m;
END;
$$;

-- RPC: Get Platform Growth (New Stores & Users per Month)
CREATE OR REPLACE FUNCTION get_platform_growth()
RETURNS TABLE (
  month text,
  new_stores bigint,
  new_users bigint
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT to_char(date_trunc('month', d), 'YYYY-MM') as m
    FROM generate_series(
      date_trunc('month', now()) - interval '11 months',
      date_trunc('month', now()),
      interval '1 month'
    ) d
  ),
  stores_data AS (
    SELECT
      to_char(date_trunc('month', created_at), 'YYYY-MM') as m,
      COUNT(*) as count
    FROM stores
    WHERE created_at >= date_trunc('month', now()) - interval '11 months'
    GROUP BY 1
  ),
  users_data AS (
    SELECT
      to_char(date_trunc('month', created_at), 'YYYY-MM') as m,
      COUNT(*) as count
    FROM users
    WHERE created_at >= date_trunc('month', now()) - interval '11 months'
    GROUP BY 1
  )
  SELECT
    months.m,
    COALESCE(stores_data.count, 0),
    COALESCE(users_data.count, 0)
  FROM months
  LEFT JOIN stores_data ON months.m = stores_data.m
  LEFT JOIN users_data ON months.m = users_data.m
  ORDER BY months.m;
END;
$$;
