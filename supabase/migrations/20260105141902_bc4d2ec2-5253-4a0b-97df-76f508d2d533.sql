-- Enable realtime payloads for updates
ALTER TABLE public.leads REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.announcements REPLICA IDENTITY FULL;
ALTER TABLE public.leaves REPLICA IDENTITY FULL;
ALTER TABLE public.activity_logs REPLICA IDENTITY FULL;

-- Ensure tables are part of realtime publication
DO $$
BEGIN
  -- add table if not already in publication
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leaves;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;