-- 1. Add stock column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN
        ALTER TABLE public.products ADD COLUMN stock integer DEFAULT 0;
    END IF;
END $$;

-- 2. Update existing products to have some stock (e.g., 10) if they are currently 0 or null
-- This ensures they don't show as "Out of Stock" immediately
UPDATE public.products SET stock = 10 WHERE stock IS NULL OR stock = 0;

-- 3. Ensure the column has a default value for future inserts
ALTER TABLE public.products ALTER COLUMN stock SET DEFAULT 0;
