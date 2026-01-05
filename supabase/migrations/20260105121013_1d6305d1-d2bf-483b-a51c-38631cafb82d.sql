-- Activity logs for audit trail
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  user_role public.app_role NOT NULL,
  module text NOT NULL,
  action text NOT NULL,
  details text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all activity
CREATE POLICY "Admins can view activity logs"
ON public.activity_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Users can view their own activity logs
CREATE POLICY "Users can view own activity logs"
ON public.activity_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own activity logs
CREATE POLICY "Users can insert own activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- No updates/deletes to keep audit integrity

-- Realtime (optional but supports instant updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;