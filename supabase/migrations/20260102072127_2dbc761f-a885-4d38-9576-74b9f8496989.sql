-- Drop existing RLS policies
DROP POLICY IF EXISTS "Staff can view own leaves" ON public.leaves;
DROP POLICY IF EXISTS "Managers can view staff and own leaves" ON public.leaves;
DROP POLICY IF EXISTS "Admins can view all leaves" ON public.leaves;
DROP POLICY IF EXISTS "Users can create own leaves" ON public.leaves;
DROP POLICY IF EXISTS "Users can update own pending leaves" ON public.leaves;
DROP POLICY IF EXISTS "Managers and admins can update leave status" ON public.leaves;

-- Create permissive policies for demo mode (allows operations without auth)
-- Staff can view own leaves (permissive - for demo allows all to view)
CREATE POLICY "Staff can view own leaves"
ON public.leaves
FOR SELECT
USING (true);

-- Managers can view staff and own leaves (permissive)
CREATE POLICY "Managers can view staff and own leaves"
ON public.leaves
FOR SELECT
USING (true);

-- Admins can view all leaves (permissive)
CREATE POLICY "Admins can view all leaves"
ON public.leaves
FOR SELECT
USING (true);

-- Allow creating leaves (permissive for demo)
CREATE POLICY "Users can create own leaves"
ON public.leaves
FOR INSERT
WITH CHECK (true);

-- Allow updating own pending leaves (permissive for demo)
CREATE POLICY "Users can update own pending leaves"
ON public.leaves
FOR UPDATE
USING (true);

-- Allow managers and admins to update status (permissive for demo)
CREATE POLICY "Managers and admins can update leave status"
ON public.leaves
FOR UPDATE
USING (true);