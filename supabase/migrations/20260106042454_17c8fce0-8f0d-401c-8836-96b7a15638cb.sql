-- Fix RLS policies for announcements and projects
-- The issue is that policies were created as RESTRICTIVE (the default in Supabase)
-- but with no PERMISSIVE policies, all inserts are blocked

-- Drop existing restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Admins can create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can delete announcements" ON public.announcements;
DROP POLICY IF EXISTS "Authenticated users can view active announcements" ON public.announcements;

CREATE POLICY "Authenticated users can view active announcements"
ON public.announcements
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can create announcements"
ON public.announcements
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update announcements"
ON public.announcements
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete announcements"
ON public.announcements
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix projects policies
DROP POLICY IF EXISTS "Authenticated users can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Admins and managers can create projects" ON public.projects;
DROP POLICY IF EXISTS "Admins and managers can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;

CREATE POLICY "Authenticated users can view all projects"
ON public.projects
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and managers can create projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins and managers can update projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can delete projects"
ON public.projects
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));