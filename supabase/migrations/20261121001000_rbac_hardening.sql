-- Apply after 20261121000000_npx_technology_schema.sql.
-- Tighten client write privileges while retaining the existing RLS policies.

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

REVOKE INSERT ON TABLE public.profiles FROM authenticated;
REVOKE INSERT (id, role, full_name, phone, created_at, updated_at)
  ON TABLE public.profiles FROM authenticated;

REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
REVOKE UPDATE (id, role, full_name, phone, created_at, updated_at)
  ON TABLE public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone) ON TABLE public.profiles TO authenticated;

REVOKE INSERT ON TABLE public.enquiries FROM authenticated;
REVOKE INSERT (id, profile_id, name, email, phone, service, message, status, created_at, updated_at)
  ON TABLE public.enquiries FROM authenticated;
GRANT INSERT (profile_id, name, email, phone, service, message)
  ON TABLE public.enquiries TO authenticated;

REVOKE INSERT ON TABLE public.messages FROM authenticated;
REVOKE INSERT (id, project_id, sender_id, body, read_at, created_at, updated_at)
  ON TABLE public.messages FROM authenticated;
GRANT INSERT (project_id, sender_id, body)
  ON TABLE public.messages TO authenticated;

REVOKE ALL ON FUNCTION public.set_profile_role(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_profile_role(uuid, text) TO authenticated;

COMMIT;
