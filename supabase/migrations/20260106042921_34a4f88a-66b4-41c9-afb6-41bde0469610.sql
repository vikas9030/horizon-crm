-- Fix activity logging triggers: activity_logs.user_id is uuid, but triggers inserted text

CREATE OR REPLACE FUNCTION public.safe_uuid(p_text text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO public
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
  VALUES (a.actor_id, a.actor_name, a.actor_role, 'leads', v_action, v_details);

  RETURN COALESCE(NEW, OLD);
END;
$$;

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
  VALUES (a.actor_id, a.actor_name, a.actor_role, 'tasks', v_action, v_details);

  RETURN COALESCE(NEW, OLD);
END;
$$;

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
  VALUES (a.actor_id, a.actor_name, a.actor_role, 'leaves', v_action, v_details);

  RETURN COALESCE(NEW, OLD);
END;
$$;