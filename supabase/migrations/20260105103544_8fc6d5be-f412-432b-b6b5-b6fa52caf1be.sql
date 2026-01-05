-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('villa', 'apartment', 'house', 'plot')),
  bhk_requirement TEXT NOT NULL,
  budget_min NUMERIC NOT NULL,
  budget_max NUMERIC NOT NULL,
  description TEXT,
  preferred_location TEXT,
  source TEXT CHECK (source IN ('call', 'walk_in', 'website', 'referral')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('interested', 'not_interested', 'pending', 'reminder')),
  follow_up_date TIMESTAMPTZ,
  notes JSONB DEFAULT '[]'::jsonb,
  created_by TEXT NOT NULL,
  assigned_project UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('visit', 'family_visit', 'pending', 'completed', 'rejected')),
  next_action_date TIMESTAMPTZ,
  notes JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  assigned_to TEXT NOT NULL,
  assigned_project UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('villa', 'apartment', 'plots')),
  price_min NUMERIC NOT NULL,
  price_max NUMERIC NOT NULL,
  launch_date DATE NOT NULL,
  possession_date DATE NOT NULL,
  amenities JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  tower_details TEXT,
  nearby_landmarks JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  cover_image TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
  target_roles JSONB NOT NULL DEFAULT '["manager", "staff"]'::jsonb,
  created_by TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- LEADS POLICIES: All authenticated users can view, create, update, delete all leads
CREATE POLICY "Authenticated users can view all leads"
ON public.leads FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create leads"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads"
ON public.leads FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete leads"
ON public.leads FOR DELETE
TO authenticated
USING (true);

-- TASKS POLICIES: All authenticated users can view, create, update, delete all tasks
CREATE POLICY "Authenticated users can view all tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create tasks"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks"
ON public.tasks FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete tasks"
ON public.tasks FOR DELETE
TO authenticated
USING (true);

-- PROJECTS POLICIES: All authenticated users can view; admins/managers can create/edit
CREATE POLICY "Authenticated users can view all projects"
ON public.projects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and managers can create projects"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Admins and managers can update projects"
ON public.projects FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Admins can delete projects"
ON public.projects FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ANNOUNCEMENTS POLICIES: Admins can manage; all authenticated can view
CREATE POLICY "Authenticated users can view active announcements"
ON public.announcements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can create announcements"
ON public.announcements FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update announcements"
ON public.announcements FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete announcements"
ON public.announcements FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add foreign key for assigned_project in leads
ALTER TABLE public.leads 
ADD CONSTRAINT leads_assigned_project_fkey 
FOREIGN KEY (assigned_project) REFERENCES public.projects(id) ON DELETE SET NULL;

-- Add foreign key for assigned_project in tasks
ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_assigned_project_fkey 
FOREIGN KEY (assigned_project) REFERENCES public.projects(id) ON DELETE SET NULL;

-- Create triggers for updated_at
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;