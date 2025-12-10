-- Add images column to products table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images') THEN
        ALTER TABLE public.products ADD COLUMN images text[] DEFAULT ARRAY[]::text[];
    END IF;
END $$;

-- Update existing products to have their image_url in the images array
UPDATE public.products 
SET images = ARRAY[image_url] 
WHERE images IS NULL OR array_length(images, 1) IS NULL;
