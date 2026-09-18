-- Update app_role enum to include 'admin'
-- Note: ALTER TYPE ... ADD VALUE cannot be executed in a transaction block in some Postgres versions.
-- However, in Supabase migrations, this is generally acceptable or handled.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';

-- Add RLS policy to allow admins to update employer profiles (for verification)
CREATE POLICY "Admins can update employer profiles"
ON public.employer_profiles
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Also allow admins to update user_roles for RBAC management
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
