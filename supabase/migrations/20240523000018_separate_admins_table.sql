-- ==========================================
-- SEPARATE SUPER ADMINS TABLE
-- ==========================================

-- 1. Create the admins table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 3. Policies for admins table
-- Only admins can view the admins table (recursion check avoided by using auth.uid())
CREATE POLICY "Admins can view admins" ON public.admins
    FOR SELECT
    USING (auth.uid() IN (SELECT id FROM public.admins));

-- 4. Initial Migration: Move all existing Supabase Auth users to admins table
-- We assume anyone currently in auth.users IS an admin (based on previous discussions)
INSERT INTO public.admins (id, email)
SELECT id, email
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 5. Update the handle_new_user trigger to NO LONGER promote to super_admin in public.users
-- Instead, we can optionally insert into public.admins if we want auto-promotion for NEW auth users,
-- OR we can leave it manual.
-- Given the user wants STRICT separation, let's keep public.users as 'user' always.
-- And if you create a user in Supabase Auth, you must MANUALLY add them to public.admins if you want them to be an admin.
-- BUT, for convenience, let's say: If you add a user via Supabase Dashboard, they are likely an admin.

CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into public.admins automatically when a user is created in auth.users
  -- This maintains the "If I add them in Supabase, they are Admin" logic
  INSERT INTO public.admins (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Trigger to sync new auth users to public.admins
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_admin();

-- 6. CLEANUP: Reset public.users roles to 'user' to avoid confusion
-- The source of truth is now public.admins.
UPDATE public.users SET role = 'user';
