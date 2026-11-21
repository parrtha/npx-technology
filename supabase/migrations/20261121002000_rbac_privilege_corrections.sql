-- Apply after the base schema and RBAC hardening migrations.
-- Reassert database-enforced role and row-access boundaries without rewriting history.

BEGIN;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

REVOKE DELETE ON TABLE public.profiles FROM PUBLIC, anon, authenticated;

REVOKE UPDATE ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
REVOKE UPDATE (id, role, full_name, phone, created_at, updated_at)
  ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
GRANT UPDATE (full_name, phone) ON TABLE public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.set_profile_role(target_profile_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change profile roles'
      USING ERRCODE = '42501';
  END IF;

  IF target_profile_id IS NULL THEN
    RAISE EXCEPTION 'A target profile is required'
      USING ERRCODE = '22023';
  END IF;

  IF target_profile_id = (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Admins cannot change their own role'
      USING ERRCODE = '42501';
  END IF;

  IF new_role IS NULL OR new_role NOT IN ('admin', 'customer') THEN
    RAISE EXCEPTION 'Role must be admin or customer'
      USING ERRCODE = '22023';
  END IF;

  UPDATE public.profiles
  SET role = new_role
  WHERE id = target_profile_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile % does not exist', target_profile_id
      USING ERRCODE = 'P0002';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.set_profile_role(uuid, text) FROM PUBLIC, anon, authenticated;
-- Supabase shares the authenticated DB role; the function body permits only admins.
GRANT EXECUTE ON FUNCTION public.set_profile_role(uuid, text) TO authenticated;

COMMIT;
