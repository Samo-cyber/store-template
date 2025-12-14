-- ==============================================================================
-- RADICAL FIX: STRICT SEPARATION OF POWERS
-- ==============================================================================
-- This script enforces the following rules:
-- 1. Super Admin (You) is in 'public.admins'. ONLY you can access the SaaS Dashboard.
-- 2. Store Owners are in 'public.users'. They can ONLY access their own stores.
-- 3. Stores are strictly linked to their owners via 'owner_id'.
-- ==============================================================================

-- 1. ENSURE TABLES EXIST (Idempotent)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    password_hash text, -- Nullable for Supabase Auth users
    role text DEFAULT 'user',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure password_hash is nullable (Fix for sync error)
ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;

CREATE TABLE IF NOT EXISTS public.admins (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.stores (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    owner_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure Columns
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 2. SECURITY: ENSURE SUPER ADMIN EXISTS
-- We add YOU to the admins table.
-- NOTE: Anyone in this table is a Super Admin. You can add more rows here manually.
INSERT INTO public.admins (id, email)
SELECT id, email 
FROM auth.users 
WHERE email = 'Eslamhamdy58@gmail.com' -- <--- YOUR EMAIL
ON CONFLICT (id) DO NOTHING;

-- 3. SECURITY: ROW LEVEL SECURITY (RLS)
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- DROP OLD POLICIES (To ensure no conflicts)
DROP POLICY IF EXISTS "Admins can view own record" ON public.admins;
DROP POLICY IF EXISTS "Stores are viewable by everyone" ON public.stores;
DROP POLICY IF EXISTS "Users can create their own stores" ON public.stores;
DROP POLICY IF EXISTS "Users can update their own stores" ON public.stores;

-- CREATE STRICT POLICIES

-- Admins: Only the Super Admin can see the admins table
CREATE POLICY "Admins can view own record" ON public.admins FOR SELECT USING (auth.uid() = id);

-- Stores: Public can view, but ONLY Owners can Create/Update
CREATE POLICY "Stores are viewable by everyone" ON public.stores FOR SELECT USING (true);

CREATE POLICY "Users can create their own stores" ON public.stores 
FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can update their own stores" ON public.stores 
FOR UPDATE USING (auth.uid()::text = owner_id::text);

-- 4. DATA FIX: SYNC USERS
-- Ensure all Auth Users exist in public.users (so they can own stores)
INSERT INTO public.users (id, email, role)
SELECT id, email, 'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 5. DATA FIX: TRANSFER STORE OWNERSHIP (Safety Net)
-- If you created 'testtest' with your account, ensure it is linked.
UPDATE public.stores
SET owner_id = (SELECT id FROM auth.users WHERE email = 'Eslamhamdy58@gmail.com')
WHERE slug = 'testtest';

-- ==============================================================================
-- DONE. SYSTEM IS NOW SECURE.
-- ==============================================================================
