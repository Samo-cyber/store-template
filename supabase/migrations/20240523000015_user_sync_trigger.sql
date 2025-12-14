-- 1. Create a function to handle new user signups
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
    new.raw_user_meta_data->>'full_name',
    'super_admin' -- FORCE SUPER ADMIN FOR EVERYONE (Safe because only Admins are in auth.users)
  );
  RETURN new;
END;
$$;

-- Update ALL existing users to be super_admin immediately
UPDATE public.users SET role = 'super_admin' WHERE id IN (SELECT id FROM auth.users);

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Helper function to easily make someone a super admin by email
CREATE OR REPLACE FUNCTION public.make_super_admin(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Find user ID from auth.users (requires permission, so we query public.users if synced, or just update public.users directly)
  -- Since we have the trigger now, the user should be in public.users
  
  UPDATE public.users
  SET role = 'super_admin'
  WHERE email = user_email
  RETURNING id INTO v_user_id;
  
  IF v_user_id IS NULL THEN
    RETURN 'User not found in public.users. They might need to sign in first, or the sync trigger was added after they signed up.';
  ELSE
    RETURN 'Success: User ' || user_email || ' is now a Super Admin.';
  END IF;
END;
$$;
