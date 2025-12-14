-- ==========================================
-- EMERGENCY FIX: RESET SUPER ADMINS
-- ==========================================

-- 1. REVOKE ACCESS FOR EVERYONE
-- This deletes all records from the admins table.
-- No one will be able to access the SaaS Dashboard after this runs.
TRUNCATE TABLE public.admins;

-- 2. ADD ONLY THE TRUE SUPER ADMIN
-- Replace 'YOUR_EMAIL@EXAMPLE.COM' with your actual Super Admin email address.
INSERT INTO public.admins (id, email)
SELECT id, email 
FROM auth.users 
WHERE email = 'YOUR_EMAIL@EXAMPLE.com'; -- <--- CHANGE THIS EMAIL

-- 3. VERIFY
-- Check who is left in the admins table
SELECT * FROM public.admins;
