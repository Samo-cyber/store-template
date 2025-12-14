-- Function to promote a user to super_admin by email
CREATE OR REPLACE FUNCTION promote_to_super_admin(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET role = 'super_admin'
  WHERE email = user_email;
END;
$$;
