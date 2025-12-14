-- ==========================================
-- FINAL DATABASE SCHEMA
-- Consolidated from 20 migrations
-- ==========================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- Users (Custom Auth for Store Owners & Customers)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    full_name text,
    phone text,
    bio text,
    role text DEFAULT 'user' CHECK (role IN ('super_admin', 'store_owner', 'user')), -- Role is mostly for UI, actual admin check is via admins table
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Admins (Super Admins - Strict Separation)
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Stores
CREATE TABLE IF NOT EXISTS public.stores (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    owner_id uuid REFERENCES public.users(id) ON DELETE CASCADE, -- References Custom Auth Users
    description text,
    settings jsonb DEFAULT '{}'::jsonb,
    template text DEFAULT 'modern',
    status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    price numeric NOT NULL,
    stock integer DEFAULT 0,
    category text,
    image_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_name text NOT NULL,
    customer_email text,
    customer_phone text,
    address jsonb,
    total_amount numeric NOT NULL,
    shipping_cost numeric DEFAULT 0,
    status text DEFAULT 'pending',
    payment_status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id),
    quantity integer NOT NULL,
    price_at_purchase numeric NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activity Logs (System Events)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    type text NOT NULL CHECK (type IN ('new_store', 'new_user', 'new_order', 'system_alert')),
    message text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Platform Settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id integer PRIMARY KEY DEFAULT 1,
    allow_registration boolean DEFAULT true,
    maintenance_mode boolean DEFAULT false,
    site_name text DEFAULT 'Prestige',
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. INDEXES
-- (Stripe indexes removed)

-- 4. ROW LEVEL SECURITY (RLS)

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Public users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (true);

-- Admins Policies
CREATE POLICY "Admins can view own record" ON public.admins FOR SELECT USING (auth.uid() = id);

-- Stores Policies
CREATE POLICY "Stores are viewable by everyone" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Users can create their own stores" ON public.stores FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text); -- Cast to text to handle uuid mismatch potential
CREATE POLICY "Users can update their own stores" ON public.stores FOR UPDATE USING (auth.uid()::text = owner_id::text);

-- Products Policies
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Store owners can insert products" ON public.products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND owner_id::text = auth.uid()::text)
);
CREATE POLICY "Store owners can update products" ON public.products FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND owner_id::text = auth.uid()::text)
);
CREATE POLICY "Store owners can delete products" ON public.products FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND owner_id::text = auth.uid()::text)
);

-- Orders Policies
CREATE POLICY "Store owners can view their orders" ON public.orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND owner_id::text = auth.uid()::text)
);

-- Order Items Policies
CREATE POLICY "Store owners can view their order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders
        JOIN public.stores ON orders.store_id = stores.id
        WHERE orders.id = order_items.order_id AND stores.owner_id::text = auth.uid()::text
    )
);

-- Activity Logs Policies
CREATE POLICY "Super Admins can view activity logs" ON public.activity_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Platform Settings Policies
CREATE POLICY "Public can view settings" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Super Admins can update settings" ON public.platform_settings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- 5. FUNCTIONS & TRIGGERS

-- Trigger: Sync New Auth User to Admins (Strict Mode)
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admins (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_admin();

-- Trigger: Log New Store
CREATE OR REPLACE FUNCTION public.log_new_store()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.activity_logs (type, message, details)
    VALUES (
        'new_store',
        'تم إنشاء متجر جديد: ' || new.name,
        jsonb_build_object('store_id', new.id, 'store_slug', new.slug)
    );
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_store_created ON public.stores;
CREATE TRIGGER on_store_created
    AFTER INSERT ON public.stores
    FOR EACH ROW EXECUTE PROCEDURE public.log_new_store();

-- Trigger: Log New User
CREATE OR REPLACE FUNCTION public.log_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF new.role = 'user' THEN
        INSERT INTO public.activity_logs (type, message, details)
        VALUES (
            'new_user',
            'مستخدم جديد انضم للمنصة: ' || new.email,
            jsonb_build_object('user_id', new.id)
        );
    END IF;
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_user_created ON public.users;
CREATE TRIGGER on_user_created
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE PROCEDURE public.log_new_user();

-- Trigger: Log New Order
CREATE OR REPLACE FUNCTION public.log_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_store_name text;
BEGIN
    SELECT name INTO v_store_name FROM public.stores WHERE id = new.store_id;
    
    INSERT INTO public.activity_logs (type, message, details)
    VALUES (
        'new_order',
        'طلب جديد بقيمة ' || new.total_amount || ' ج.م في متجر ' || COALESCE(v_store_name, 'Unknown'),
        jsonb_build_object('order_id', new.id, 'store_id', new.store_id, 'amount', new.total_amount)
    );
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_order_created ON public.orders;
CREATE TRIGGER on_order_created
    AFTER INSERT ON public.orders
    FOR EACH ROW EXECUTE PROCEDURE public.log_new_order();

-- Function: Create Order (Transactional)
CREATE OR REPLACE FUNCTION create_order(
  p_store_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_address jsonb,
  p_total_amount numeric,
  p_items jsonb,
  p_shipping_cost numeric DEFAULT 0,
  p_customer_email text DEFAULT null,
  p_payment_status text DEFAULT 'pending'
) RETURNS uuid AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_product_stock integer;
BEGIN
  -- 1. Create Order
  INSERT INTO public.orders (
    store_id, 
    customer_name, 
    customer_email, 
    customer_phone, 
    address, 
    total_amount, 
    shipping_cost,
    payment_status
  )
  VALUES (
    p_store_id, 
    p_customer_name, 
    p_customer_email, 
    p_customer_phone, 
    p_address, 
    p_total_amount, 
    p_shipping_cost,
    p_payment_status
  )
  RETURNING id INTO v_order_id;

  -- 2. Process Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Check stock
    SELECT stock INTO v_product_stock FROM public.products WHERE id = (v_item->>'id')::uuid;
    
    IF v_product_stock < (v_item->>'quantity')::integer THEN
      RAISE EXCEPTION 'Insufficient stock for product %', (v_item->>'id');
    END IF;

    -- Insert Order Item
    INSERT INTO public.order_items (order_id, product_id, quantity, price_at_purchase)
    VALUES (
      v_order_id,
      (v_item->>'id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'price')::numeric
    );

    -- Update Stock
    UPDATE public.products
    SET stock = stock - (v_item->>'quantity')::integer
    WHERE id = (v_item->>'id')::uuid;
  END LOOP;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ANALYTICS RPCs

-- Get Dashboard Stats (Store Owner)
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
  IF NOT EXISTS (SELECT 1 FROM public.stores WHERE id = p_store_id AND owner_id::text = auth.uid()::text) THEN
    RAISE EXCEPTION 'Unauthorized Access';
  END IF;

  SELECT COALESCE(SUM(total_amount), 0) INTO v_total_revenue FROM orders WHERE store_id = p_store_id AND status != 'cancelled';
  SELECT COUNT(*) INTO v_total_orders FROM orders WHERE store_id = p_store_id;
  SELECT COUNT(*) INTO v_total_products FROM products WHERE store_id = p_store_id;
  SELECT COUNT(*) INTO v_low_stock_count FROM products WHERE store_id = p_store_id AND stock < 10;

  RETURN json_build_object(
    'totalRevenue', v_total_revenue,
    'totalOrders', v_total_orders,
    'totalProducts', v_total_products,
    'lowStockCount', v_low_stock_count
  );
END;
$$;

-- Get Monthly Sales (Store Owner)
CREATE OR REPLACE FUNCTION get_monthly_sales(p_store_id uuid)
RETURNS TABLE (month text, revenue numeric, orders_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.stores WHERE id = p_store_id AND owner_id::text = auth.uid()::text) THEN
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

-- Get Top Products (Store Owner)
CREATE OR REPLACE FUNCTION get_top_products(p_store_id uuid)
RETURNS TABLE (product_id uuid, product_title text, product_image text, total_sold integer, total_revenue numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.stores WHERE id = p_store_id AND owner_id::text = auth.uid()::text) THEN
    RAISE EXCEPTION 'Unauthorized Access';
  END IF;

  RETURN QUERY
  SELECT
    p.id, p.title, p.image_url,
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

-- Get Platform Stats (Super Admin)
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
  SELECT COUNT(*) INTO v_total_stores FROM stores;
  SELECT COUNT(*) INTO v_total_users FROM users;
  SELECT COALESCE(SUM(total_amount), 0) INTO v_total_revenue FROM orders WHERE status != 'cancelled';

  RETURN json_build_object(
    'totalStores', v_total_stores,
    'totalUsers', v_total_users,
    'totalRevenue', v_total_revenue
  );
END;
$$;

-- Get All Stores Analytics (Super Admin)
CREATE OR REPLACE FUNCTION get_all_stores_analytics()
RETURNS TABLE (store_id uuid, store_name text, store_slug text, owner_email text, total_revenue numeric, total_orders integer, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id, s.name, s.slug, p.email,
    COALESCE(SUM(o.total_amount) FILTER (WHERE o.status != 'cancelled'), 0),
    COUNT(o.id)::integer,
    s.created_at
  FROM stores s
  LEFT JOIN users p ON s.owner_id = p.id
  LEFT JOIN orders o ON s.id = o.store_id
  GROUP BY s.id, s.name, s.slug, p.email, s.created_at
  ORDER BY total_revenue DESC;
END;
$$;

-- Get Admin Activity Feed (Super Admin)
CREATE OR REPLACE FUNCTION get_admin_activity_feed()
RETURNS TABLE (id uuid, type text, message text, details jsonb, created_at timestamp with time zone, time_ago text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        al.id, al.type, al.message, al.details, al.created_at,
        CASE
            WHEN now() - al.created_at < interval '1 minute' THEN 'الآن'
            WHEN now() - al.created_at < interval '1 hour' THEN extract(minutes from now() - al.created_at)::text || ' دقيقة'
            WHEN now() - al.created_at < interval '1 day' THEN extract(hours from now() - al.created_at)::text || ' ساعة'
            ELSE extract(days from now() - al.created_at)::text || ' يوم'
        END as time_ago
    FROM public.activity_logs al
    ORDER BY al.created_at DESC
    LIMIT 20;
END;
$$;

-- Get Global Recent Orders (Super Admin)
CREATE OR REPLACE FUNCTION get_global_recent_orders()
RETURNS TABLE (id uuid, customer_name text, total_amount numeric, status text, created_at timestamp with time zone, store_name text, store_slug text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id, o.customer_name, o.total_amount, o.status, o.created_at,
        s.name, s.slug
    FROM public.orders o
    JOIN public.stores s ON o.store_id = s.id
    ORDER BY o.created_at DESC
    LIMIT 10;
END;
$$;

-- Store Management Functions
CREATE OR REPLACE FUNCTION suspend_store(p_store_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.stores SET status = 'suspended' WHERE id = p_store_id;
END;
$$;

CREATE OR REPLACE FUNCTION activate_store(p_store_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.stores SET status = 'active' WHERE id = p_store_id;
END;
$$;

-- 7. SEED DATA (Default Settings)
INSERT INTO public.platform_settings (id, allow_registration, maintenance_mode, site_name)
VALUES (1, true, false, 'Prestige')
ON CONFLICT (id) DO NOTHING;

-- 8. MIGRATION HELPERS (One-time run)
-- Ensure existing auth users are in admins table
INSERT INTO public.admins (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
