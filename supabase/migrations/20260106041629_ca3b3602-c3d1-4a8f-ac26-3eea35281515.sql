-- Log activity automatically via DB triggers

-- Helper: safely cast text to uuid (returns null on failure)
CREATE OR REPLACE FUNCTION public.safe_uuid(p_text text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_uuid uuid;
BEGIN
  IF p_text IS NULL OR btrim(p_text) = '' THEN
    RETURN NULL;
  END IF;

  BEGIN
    v_uuid := p_text::uuid;
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;

  RETURN v_uuid;
END;
$$;

-- Helper: resolve current actor (id, name, role)
CREATE OR REPLACE FUNCTION public.get_actor()
RETURNS TABLE(actor_id uuid, actor_name text, actor_role public.app_role)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  actor_id := auth.uid();

  SELECT p.name
  INTO actor_name
  FROM public.profiles p
  WHERE p.user_id = actor_id::text
  LIMIT 1;

  SELECT ur.role
  INTO actor_role
  FROM public.user_roles ur
  WHERE ur.user_id = actor_id
  LIMIT 1;

  actor_name := COALESCE(actor_name, 'Unknown');
  actor_role := COALESCE(actor_role, 'staff');

  RETURN NEXT;
END;
$$;

-- Leads trigger
CREATE OR REPLACE FUNCTION public.trg_activity_log_leads()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  a record;
  v_action text;
  v_details text;
BEGIN
  SELECT * INTO a FROM public.get_actor();

  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    v_details := 'a lead: ' || COALESCE(NEW.name, '');
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'updated';
    v_details := 'a lead: ' || COALESCE(NEW.name, '');
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
    v_details := 'a lead: ' || COALESCE(OLD.name, '');
  END IF;

  INSERT INTO public.activity_logs (user_id, user_name, user_role, module, action, details)
  VALUES (a.actor_id::text, a.actor_name, a.actor_role, 'leads', v_action, v_details);

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS activity_log_leads ON public.leads;
CREATE TRIGGER activity_log_leads
AFTER INSERT OR UPDATE OR DELETE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.trg_activity_log_leads();

-- Tasks trigger
CREATE OR REPLACE FUNCTION public.trg_activity_log_tasks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  a record;
  v_action text;
  v_details text;
BEGIN
  SELECT * INTO a FROM public.get_actor();

  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    v_details := 'a task (status: ' || COALESCE(NEW.status, '') || ')';
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'updated';
    v_details := 'a task (status: ' || COALESCE(NEW.status, '') || ')';
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
    v_details := 'a task (status: ' || COALESCE(OLD.status, '') || ')';
  END IF;

  INSERT INTO public.activity_logs (user_id, user_name, user_role, module, action, details)
  VALUES (a.actor_id::text, a.actor_name, a.actor_role, 'tasks', v_action, v_details);

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS activity_log_tasks ON public.tasks;
CREATE TRIGGER activity_log_tasks
AFTER INSERT OR UPDATE OR DELETE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.trg_activity_log_tasks();

-- Leaves trigger
CREATE OR REPLACE FUNCTION public.trg_activity_log_leaves()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  a record;
  v_action text;
  v_details text;
BEGIN
  SELECT * INTO a FROM public.get_actor();

  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    v_details := 'a leave request (' || COALESCE(NEW.leave_type, '') || ')';
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'updated';
    v_details := 'a leave request (' || COALESCE(NEW.leave_type, '') || '), status: ' || COALESCE(NEW.status, '');
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
    v_details := 'a leave request (' || COALESCE(OLD.leave_type, '') || ')';
  END IF;

  INSERT INTO public.activity_logs (user_id, user_name, user_role, module, action, details)
  VALUES (a.actor_id::text, a.actor_name, a.actor_role, 'leaves', v_action, v_details);

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS activity_log_leaves ON public.leaves;
CREATE TRIGGER activity_log_leaves
AFTER INSERT OR UPDATE OR DELETE ON public.leaves
FOR EACH ROW
EXECUTE FUNCTION public.trg_activity_log_leaves();
