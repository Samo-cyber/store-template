-- Add template column to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS template text DEFAULT 'modern';

-- Update existing stores to have 'modern' template
UPDATE public.stores SET template = 'modern' WHERE template IS NULL;
