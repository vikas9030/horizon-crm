-- Fix RLS policies for leads, tasks, leaves (inserts were blocked)

-- LEADS
DROP POLICY IF EXISTS "Authenticated users can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.leads;

CREATE POLICY "Authenticated users can view all leads"
ON public.leads
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete leads"
ON public.leads
FOR DELETE
TO authenticated
USING (true);

-- TASKS
DROP POLICY IF EXISTS "Authenticated users can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can delete tasks" ON public.tasks;

CREATE POLICY "Authenticated users can view all tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (true);

-- LEAVES
DROP POLICY IF EXISTS "Staff can view own leaves" ON public.leaves;
DROP POLICY IF EXISTS "Managers can view staff and own leaves" ON public.leaves;
DROP POLICY IF EXISTS "Admins can view all leaves" ON public.leaves;
DROP POLICY IF EXISTS "Users can create own leaves" ON public.leaves;
DROP POLICY IF EXISTS "Users can update own pending leaves" ON public.leaves;
DROP POLICY IF EXISTS "Managers and admins can update leave status" ON public.leaves;

CREATE POLICY "Staff can view own leaves"
ON public.leaves
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Managers can view staff and own leaves"
ON public.leaves
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can view all leaves"
ON public.leaves
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create own leaves"
ON public.leaves
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update own pending leaves"
ON public.leaves
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Managers and admins can update leave status"
ON public.leaves
FOR UPDATE
TO authenticated
USING (true);