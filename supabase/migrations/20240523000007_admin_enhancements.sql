-- Create platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id integer PRIMARY KEY DEFAULT 1,
  allow_registration boolean DEFAULT true,
  maintenance_mode boolean DEFAULT false,
  site_name text DEFAULT 'Prestige',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Insert default settings if not exists
INSERT INTO public.platform_settings (id, allow_registration, maintenance_mode, site_name)
VALUES (1, true, false, 'Prestige')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view settings"
  ON public.platform_settings FOR SELECT
  USING ( true );

CREATE POLICY "Super Admins can update settings"
  ON public.platform_settings FOR UPDATE
  USING ( 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
    OR 
    -- Allow Supabase Auth Super Admins (if using service role or direct auth check)
    (auth.jwt() ->> 'role' = 'service_role')
  );

-- RPC: Get Store Products (Super Admin)
CREATE OR REPLACE FUNCTION get_store_products_admin(p_store_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  price numeric,
  stock integer,
  category text,
  image_url text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is super admin (optional, but good for security)
  -- For now, we rely on the API/Page to protect this call
  
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.price,
    p.stock,
    p.category,
    p.image_url,
    p.created_at
  FROM products p
  WHERE p.store_id = p_store_id
  ORDER BY p.created_at DESC;
END;
$$;
