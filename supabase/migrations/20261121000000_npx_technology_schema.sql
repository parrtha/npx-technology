-- NPX TECHNOLOGY application schema.
-- This migration intentionally fails if any of these objects already exist.

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'customer'
    CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'customer')),
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  email text NOT NULL CHECK (length(trim(email)) > 0),
  phone text,
  service text,
  message text NOT NULL CHECK (length(trim(message)) > 0),
  status text NOT NULL DEFAULT 'new'
    CONSTRAINT enquiries_status_check
    CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES public.profiles (id) ON DELETE SET NULL,
  company_name text,
  contact_name text NOT NULL CHECK (length(trim(contact_name)) > 0),
  email text NOT NULL CHECK (length(trim(email)) > 0),
  phone text,
  status text NOT NULL DEFAULT 'active'
    CONSTRAINT customers_status_check
    CHECK (status IN ('active', 'inactive', 'prospect')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers (id) ON DELETE RESTRICT,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  description text,
  status text NOT NULL DEFAULT 'planned'
    CONSTRAINT projects_status_check
    CHECK (status IN ('planned', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  start_date date,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT projects_due_date_check
    CHECK (due_date IS NULL OR start_date IS NULL OR due_date >= start_date),
  CONSTRAINT projects_id_customer_id_key UNIQUE (id, customer_id)
);

CREATE TABLE public.project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  description text,
  status text NOT NULL DEFAULT 'pending'
    CONSTRAINT project_milestones_status_check
    CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  body text NOT NULL CHECK (length(trim(body)) > 0),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers (id) ON DELETE RESTRICT,
  project_id uuid,
  description text NOT NULL CHECK (length(trim(description)) > 0),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'USD'
    CONSTRAINT payments_currency_check CHECK (currency ~ '^[A-Z]{3}$'),
  status text NOT NULL DEFAULT 'pending'
    CONSTRAINT payments_status_check
    CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled')),
  due_at timestamptz,
  paid_at timestamptz,
  invoice_reference text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payments_project_customer_fkey
    FOREIGN KEY (project_id, customer_id)
    REFERENCES public.projects (id, customer_id)
    ON DELETE CASCADE
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(trim(title)) > 0),
  body text NOT NULL CHECK (length(trim(body)) > 0),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers (id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects (id) ON DELETE SET NULL,
  action text NOT NULL CHECK (length(trim(action)) > 0),
  entity_type text NOT NULL CHECK (length(trim(entity_type)) > 0),
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb
    CONSTRAINT activity_logs_details_object_check
    CHECK (jsonb_typeof(details) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX enquiries_profile_created_at_idx
  ON public.enquiries (profile_id, created_at DESC);
CREATE INDEX enquiries_status_created_at_idx
  ON public.enquiries (status, created_at DESC);
CREATE INDEX customers_status_idx ON public.customers (status);
CREATE INDEX projects_customer_status_idx
  ON public.projects (customer_id, status);
CREATE INDEX project_milestones_project_status_idx
  ON public.project_milestones (project_id, status);
CREATE INDEX messages_project_created_at_idx
  ON public.messages (project_id, created_at DESC);
CREATE INDEX messages_sender_created_at_idx
  ON public.messages (sender_id, created_at DESC);
CREATE INDEX payments_customer_status_idx
  ON public.payments (customer_id, status);
CREATE INDEX payments_project_id_idx ON public.payments (project_id);
CREATE INDEX notifications_user_created_at_idx
  ON public.notifications (user_id, created_at DESC);
CREATE INDEX notifications_unread_user_idx
  ON public.notifications (user_id)
  WHERE read_at IS NULL;
CREATE INDEX activity_logs_created_at_idx
  ON public.activity_logs (created_at DESC);
CREATE INDEX activity_logs_entity_idx
  ON public.activity_logs (entity_type, entity_id);

CREATE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER enquiries_set_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER customers_set_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER project_milestones_set_updated_at
  BEFORE UPDATE ON public.project_milestones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER messages_set_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER payments_set_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER notifications_set_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER activity_logs_set_updated_at
  BEFORE UPDATE ON public.activity_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
  );
$$;

CREATE FUNCTION public.set_profile_role(target_profile_id uuid, new_role text)
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

CREATE FUNCTION public.create_profile_for_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')), '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_auth_user();

CREATE FUNCTION public.guard_notification_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin()
     AND (
       NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.title IS DISTINCT FROM OLD.title
       OR NEW.body IS DISTINCT FROM OLD.body
       OR NEW.created_at IS DISTINCT FROM OLD.created_at
     )
  THEN
    RAISE EXCEPTION 'Customers may only mark their own notifications as read'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER notifications_guard_update
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.guard_notification_update();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own
  ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));
CREATE POLICY profiles_admin_all
  ON public.profiles FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY enquiries_select_own
  ON public.enquiries FOR SELECT TO authenticated
  USING (profile_id = (SELECT auth.uid()));
CREATE POLICY enquiries_insert_own
  ON public.enquiries FOR INSERT TO authenticated
  WITH CHECK (
    profile_id = (SELECT auth.uid())
    AND status = 'new'
  );
CREATE POLICY enquiries_admin_all
  ON public.enquiries FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY customers_select_own
  ON public.customers FOR SELECT TO authenticated
  USING (profile_id = (SELECT auth.uid()));
CREATE POLICY customers_admin_all
  ON public.customers FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY projects_select_own
  ON public.projects FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.customers AS customer
      WHERE customer.id = projects.customer_id
        AND customer.profile_id = (SELECT auth.uid())
    )
  );
CREATE POLICY projects_admin_all
  ON public.projects FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY project_milestones_select_own
  ON public.project_milestones FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects AS project
      JOIN public.customers AS customer ON customer.id = project.customer_id
      WHERE project.id = project_milestones.project_id
        AND customer.profile_id = (SELECT auth.uid())
    )
  );
CREATE POLICY project_milestones_admin_all
  ON public.project_milestones FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY messages_select_own
  ON public.messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects AS project
      JOIN public.customers AS customer ON customer.id = project.customer_id
      WHERE project.id = messages.project_id
        AND customer.profile_id = (SELECT auth.uid())
    )
  );
CREATE POLICY messages_insert_own
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.projects AS project
      JOIN public.customers AS customer ON customer.id = project.customer_id
      WHERE project.id = messages.project_id
        AND customer.profile_id = (SELECT auth.uid())
    )
  );
CREATE POLICY messages_admin_all
  ON public.messages FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY payments_select_own
  ON public.payments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.customers AS customer
      WHERE customer.id = payments.customer_id
        AND customer.profile_id = (SELECT auth.uid())
    )
  );
CREATE POLICY payments_admin_all
  ON public.payments FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY notifications_select_own
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY notifications_update_own
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY notifications_admin_all
  ON public.notifications FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY activity_logs_admin_all
  ON public.activity_logs FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

REVOKE ALL ON TABLE
  public.profiles,
  public.enquiries,
  public.customers,
  public.projects,
  public.project_milestones,
  public.messages,
  public.payments,
  public.notifications,
  public.activity_logs
FROM anon, authenticated;

GRANT SELECT, INSERT, DELETE ON public.profiles TO authenticated;
GRANT UPDATE (full_name, phone) ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.enquiries,
  public.customers,
  public.projects,
  public.project_milestones,
  public.messages,
  public.payments,
  public.notifications,
  public.activity_logs
TO authenticated;

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_profile_role(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_profile_for_auth_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_notification_update() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_profile_role(uuid, text) TO authenticated;
