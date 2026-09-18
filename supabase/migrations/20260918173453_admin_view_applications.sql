-- Allow admins to view all applications for monitoring and reporting
CREATE POLICY "Admins can view all applications"
ON public.applications
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
