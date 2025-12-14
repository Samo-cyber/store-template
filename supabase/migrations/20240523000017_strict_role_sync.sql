-- ==========================================
-- STRICT ROLE ENFORCEMENT (The "Radical Solution")
-- ==========================================

-- 1. DEMOTE everyone who is NOT in Supabase Auth
-- This fixes the issue where normal customers were accidentally made Super Admins
UPDATE public.users 
SET role = 'user' 
WHERE id NOT IN (SELECT id FROM auth.users);

-- 2. PROMOTE everyone who IS in Supabase Auth
-- This ensures you (the developer/admin) have access
UPDATE public.users 
SET role = 'super_admin' 
WHERE id IN (SELECT id FROM auth.users);

-- 3. Ensure the Trigger is Correct (for future users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'super_admin' -- Anyone added via Supabase Auth is an Admin
  );
  RETURN new;
END;
$$;

-- 4. Double Check: Ensure no 'user' role exists in auth.users (just in case)
-- (Optional, but good for consistency)
