-- ==========================================
-- Super Admin Dashboard V2 Migration
-- ==========================================

-- 1. Add 'status' column to stores table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'status') THEN
        ALTER TABLE public.stores ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending'));
    END IF;
END $$;

-- 2. Create Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    type text NOT NULL CHECK (type IN ('new_store', 'new_user', 'new_order', 'system_alert')),
    message text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only Super Admins can view activity logs
DROP POLICY IF EXISTS "Super Admins can view activity logs" ON public.activity_logs;
CREATE POLICY "Super Admins can view activity logs"
    ON public.activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- 3. Triggers for Activity Logging

-- Trigger: New Store
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

-- Trigger: New User (Public Users)
CREATE OR REPLACE FUNCTION public.log_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only log if role is 'user' (customer), not admin
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

-- Trigger: New Order
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

-- 4. RPC Functions for Dashboard

-- Get Activity Feed
CREATE OR REPLACE FUNCTION get_admin_activity_feed()
RETURNS TABLE (
    id uuid,
    type text,
    message text,
    details jsonb,
    created_at timestamp with time zone,
    time_ago text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        al.id,
        al.type,
        al.message,
        al.details,
        al.created_at,
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

-- Get Global Recent Orders
CREATE OR REPLACE FUNCTION get_global_recent_orders()
RETURNS TABLE (
    id uuid,
    customer_name text,
    total_amount numeric,
    status text,
    created_at timestamp with time zone,
    store_name text,
    store_slug text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.customer_name,
        o.total_amount,
        o.status,
        o.created_at,
        s.name as store_name,
        s.slug as store_slug
    FROM public.orders o
    JOIN public.stores s ON o.store_id = s.id
    ORDER BY o.created_at DESC
    LIMIT 10;
END;
$$;

-- Suspend Store
CREATE OR REPLACE FUNCTION suspend_store(p_store_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.stores
    SET status = 'suspended'
    WHERE id = p_store_id;
END;
$$;

-- Activate Store
CREATE OR REPLACE FUNCTION activate_store(p_store_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.stores
    SET status = 'active'
    WHERE id = p_store_id;
END;
$$;
