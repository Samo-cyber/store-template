-- Fix stores owner_id foreign key to reference public.users instead of auth.users

-- 1. Drop existing foreign key
ALTER TABLE public.stores
DROP CONSTRAINT IF EXISTS stores_owner_id_fkey;

-- 2. Clean up orphan stores (stores where owner_id is not in public.users)
DELETE FROM public.stores
WHERE owner_id NOT IN (SELECT id FROM public.users);

-- 3. Add new foreign key referencing public.users
ALTER TABLE public.stores
ADD CONSTRAINT stores_owner_id_fkey
FOREIGN KEY (owner_id)
REFERENCES public.users(id)
ON DELETE CASCADE;
