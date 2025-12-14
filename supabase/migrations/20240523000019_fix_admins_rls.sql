-- ==========================================
-- FIX ADMINS RLS POLICY
-- ==========================================

-- 1. Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can view admins" ON public.admins;

-- 2. Create a safer, non-recursive policy
-- Users can see THEIR OWN record in the admins table.
-- This is sufficient for the "Am I an admin?" check.
CREATE POLICY "Admins can view own record" ON public.admins
    FOR SELECT
    USING (auth.uid() = id);

-- 3. Ensure you are in the admins table (Re-run sync)
INSERT INTO public.admins (id, email)
SELECT id, email
FROM auth.users
ON CONFLICT (id) DO NOTHING;
