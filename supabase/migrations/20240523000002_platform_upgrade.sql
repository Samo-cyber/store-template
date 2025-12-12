-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  role text DEFAULT 'user' CHECK (role IN ('super_admin', 'store_owner', 'user')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Trigger to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

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
  SELECT COUNT(*) INTO v_total_users FROM profiles;

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
  LEFT JOIN profiles p ON s.owner_id = p.id
  LEFT JOIN orders o ON s.id = o.store_id
  GROUP BY s.id, s.name, s.slug, p.email, s.created_at
  ORDER BY total_revenue DESC;
END;
$$;
