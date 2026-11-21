-- Add the public website-theme catalog and its private preview-image storage.
-- Apply after the existing NPX schema and RBAC migrations.

BEGIN;

CREATE TABLE public.website_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL
    CONSTRAINT website_themes_name_check
    CHECK (length(trim(name)) BETWEEN 2 AND 80),
  slug text NOT NULL UNIQUE
    CONSTRAINT website_themes_slug_check
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  short_description text NOT NULL
    CONSTRAINT website_themes_short_description_check
    CHECK (length(trim(short_description)) BETWEEN 8 AND 240),
  description text NOT NULL
    CONSTRAINT website_themes_description_check
    CHECK (length(trim(description)) BETWEEN 20 AND 4000),
  category text NOT NULL
    CONSTRAINT website_themes_category_check
    CHECK (length(trim(category)) BETWEEN 2 AND 80),
  colors jsonb NOT NULL
    CONSTRAINT website_themes_colors_check
    CHECK (
      jsonb_typeof(colors) = 'object'
      AND colors ?& ARRAY['primary', 'secondary', 'accent', 'surface', 'text']
      AND colors ->> 'primary' ~ '^#[0-9A-Fa-f]{6}$'
      AND colors ->> 'secondary' ~ '^#[0-9A-Fa-f]{6}$'
      AND colors ->> 'accent' ~ '^#[0-9A-Fa-f]{6}$'
      AND colors ->> 'surface' ~ '^#[0-9A-Fa-f]{6}$'
      AND colors ->> 'text' ~ '^#[0-9A-Fa-f]{6}$'
    ),
  suitable_business_types text[] NOT NULL DEFAULT '{}'
    CONSTRAINT website_themes_business_types_check
    CHECK (cardinality(suitable_business_types) <= 20),
  preview_image_path text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT website_themes_preview_path_check
    CHECK (
      preview_image_path IS NULL
      OR preview_image_path ~ '^[0-9a-f-]{36}/[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp)$'
    )
);

CREATE INDEX website_themes_published_category_idx
  ON public.website_themes (category, name)
  WHERE is_published;
CREATE INDEX website_themes_updated_at_idx
  ON public.website_themes (updated_at DESC);

CREATE TRIGGER website_themes_set_updated_at
  BEFORE UPDATE ON public.website_themes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.enquiries
  ADD COLUMN business_name text,
  ADD COLUMN business_category text,
  ADD COLUMN website_type text,
  ADD COLUMN budget_range text,
  ADD COLUMN selected_theme_id uuid
    REFERENCES public.website_themes (id) ON DELETE SET NULL,
  ADD COLUMN selected_theme_name text,
  ADD COLUMN selected_theme_category text,
  ADD COLUMN selected_theme_colors jsonb,
  ADD COLUMN selected_theme_preview_path text;

ALTER TABLE public.enquiries
  ADD CONSTRAINT enquiries_business_name_check
    CHECK (business_name IS NULL OR length(trim(business_name)) BETWEEN 1 AND 160),
  ADD CONSTRAINT enquiries_business_category_check
    CHECK (business_category IS NULL OR length(trim(business_category)) BETWEEN 1 AND 100),
  ADD CONSTRAINT enquiries_website_type_check
    CHECK (website_type IS NULL OR length(trim(website_type)) BETWEEN 1 AND 120),
  ADD CONSTRAINT enquiries_budget_range_check
    CHECK (budget_range IS NULL OR length(trim(budget_range)) BETWEEN 1 AND 80),
  ADD CONSTRAINT enquiries_selected_theme_name_check
    CHECK (selected_theme_name IS NULL OR length(trim(selected_theme_name)) BETWEEN 2 AND 80),
  ADD CONSTRAINT enquiries_selected_theme_category_check
    CHECK (selected_theme_category IS NULL OR length(trim(selected_theme_category)) BETWEEN 2 AND 80),
  ADD CONSTRAINT enquiries_selected_theme_colors_check
    CHECK (
      selected_theme_colors IS NULL
      OR jsonb_typeof(selected_theme_colors) = 'object'
    ),
  ADD CONSTRAINT enquiries_selected_theme_preview_path_check
    CHECK (
      selected_theme_preview_path IS NULL
      OR selected_theme_preview_path ~ '^[0-9a-f-]{36}/[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp)$'
    );

CREATE INDEX enquiries_selected_theme_id_idx
  ON public.enquiries (selected_theme_id)
  WHERE selected_theme_id IS NOT NULL;
CREATE INDEX enquiries_profile_selected_theme_idx
  ON public.enquiries (profile_id, created_at DESC)
  WHERE selected_theme_id IS NOT NULL;

CREATE FUNCTION public.snapshot_enquiry_website_theme()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  theme_name text;
  theme_category text;
  theme_colors jsonb;
  theme_preview_path text;
  theme_is_published boolean;
BEGIN
  IF NEW.selected_theme_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT theme.name, theme.category, theme.colors,
         theme.preview_image_path, theme.is_published
    INTO theme_name, theme_category, theme_colors,
         theme_preview_path, theme_is_published
  FROM public.website_themes AS theme
  WHERE theme.id = NEW.selected_theme_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'The selected website theme is unavailable.'
      USING ERRCODE = '23503';
  END IF;

  IF NOT theme_is_published AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only published website themes may be selected.'
      USING ERRCODE = '42501';
  END IF;

  NEW.selected_theme_name := theme_name;
  NEW.selected_theme_category := theme_category;
  NEW.selected_theme_colors := theme_colors;
  NEW.selected_theme_preview_path := theme_preview_path;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enquiries_snapshot_website_theme
  BEFORE INSERT OR UPDATE OF selected_theme_id ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_enquiry_website_theme();

ALTER TABLE public.website_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY website_themes_public_read_published
  ON public.website_themes FOR SELECT TO anon, authenticated
  USING (is_published);
CREATE POLICY website_themes_admin_manage
  ON public.website_themes FOR ALL TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

REVOKE ALL ON TABLE public.website_themes FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.website_themes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.website_themes TO authenticated;

REVOKE ALL ON FUNCTION public.snapshot_enquiry_website_theme()
  FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS enquiries_insert_public ON public.enquiries;
CREATE POLICY enquiries_insert_public
  ON public.enquiries FOR INSERT TO anon
  WITH CHECK (profile_id IS NULL AND status = 'new');

REVOKE INSERT ON TABLE public.enquiries FROM anon, authenticated;
REVOKE INSERT (
  id, profile_id, name, email, phone, service, message, status, created_at,
  updated_at, business_name, business_category, website_type, budget_range,
  selected_theme_id, selected_theme_name, selected_theme_category,
  selected_theme_colors, selected_theme_preview_path
) ON TABLE public.enquiries FROM anon, authenticated;
GRANT INSERT (
  name, email, phone, service, message, business_name, business_category,
  website_type, budget_range, selected_theme_id
) ON TABLE public.enquiries TO anon;
GRANT INSERT (
  profile_id, name, email, phone, service, message, business_name,
  business_category, website_type, budget_range, selected_theme_id
) ON TABLE public.enquiries TO authenticated;

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'npx-website-theme-previews',
  'npx-website-theme-previews',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'npx-website-theme-previews'
      AND name = 'npx-website-theme-previews'
      AND public = false
      AND file_size_limit = 5242880
      AND allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
  ) THEN
    RAISE EXCEPTION
      'The npx-website-theme-previews bucket already exists with incompatible settings; review it manually before applying this migration.';
  END IF;
END;
$$;

CREATE POLICY npx_theme_previews_public_published_read
  ON storage.objects FOR SELECT TO anon
  USING (
    bucket_id = 'npx-website-theme-previews'
    AND EXISTS (
      SELECT 1
      FROM public.website_themes AS theme
      WHERE theme.preview_image_path = name
        AND theme.is_published
    )
  );

CREATE POLICY npx_theme_previews_authenticated_read
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'npx-website-theme-previews'
    AND (
      (SELECT public.is_admin())
      OR EXISTS (
        SELECT 1
        FROM public.website_themes AS theme
        WHERE theme.preview_image_path = name
          AND theme.is_published
      )
      OR EXISTS (
        SELECT 1
        FROM public.enquiries AS enquiry
        WHERE enquiry.profile_id = (SELECT auth.uid())
          AND enquiry.selected_theme_preview_path = name
      )
    )
  );

CREATE POLICY npx_theme_previews_admin_insert
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'npx-website-theme-previews'
    AND (SELECT public.is_admin())
  );
CREATE POLICY npx_theme_previews_admin_update
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'npx-website-theme-previews'
    AND (SELECT public.is_admin())
  )
  WITH CHECK (
    bucket_id = 'npx-website-theme-previews'
    AND (SELECT public.is_admin())
  );
CREATE POLICY npx_theme_previews_admin_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'npx-website-theme-previews'
    AND (SELECT public.is_admin())
  );

INSERT INTO public.website_themes (
  name, slug, short_description, description, category, colors,
  suitable_business_types, is_published
)
VALUES
  (
    'Minimal Premium',
    'minimal-premium',
    'A calm, editorial layout with warm neutrals and crisp typography.',
    'An understated website direction built around generous spacing, clear content hierarchy, and warm neutral surfaces. It is intended as a starting point for professional, personal, and luxury businesses.',
    'Minimal',
    '{"primary":"#252525","secondary":"#E6DCCB","accent":"#A58B66","surface":"#F9F7F2","text":"#242424"}'::jsonb,
    ARRAY['Personal portfolios', 'Consultants', 'Professional services', 'Luxury businesses'],
    true
  ),
  (
    'Dark Modern',
    'dark-modern',
    'A focused dark interface with confident blue and cyan accents.',
    'A modern dark website direction with layered navy surfaces, restrained electric-blue accents, and clear interface contrast. It is suitable for technology products, SaaS businesses, startups, and agencies.',
    'Dark',
    '{"primary":"#102A56","secondary":"#1769C2","accent":"#18C7DF","surface":"#080D1C","text":"#F7FAFF"}'::jsonb,
    ARRAY['Technology companies', 'SaaS businesses', 'Startups', 'Agencies'],
    true
  ),
  (
    'Neon Gradient',
    'neon-gradient',
    'A creative gradient direction with purple, magenta, and cyan.',
    'A bold but controlled gradient website direction for creative teams and digital brands. The preview uses original CSS-built interface compositions and does not include game imagery, logos, or screenshots.',
    'Creative',
    '{"primary":"#8B5CF6","secondary":"#D946EF","accent":"#18C7DF","surface":"#111329","text":"#F8FAFC"}'::jsonb,
    ARRAY['Creative agencies', 'Digital brands', 'Modern portfolios'],
    true
  ),
  (
    'Luxury Gold',
    'luxury-gold',
    'A refined dark palette with warm gold and soft ivory details.',
    'A restrained luxury website direction pairing near-black surfaces with warm gold details and readable ivory typography. It can support hospitality, premium dining, real estate, and luxury brands.',
    'Luxury',
    '{"primary":"#C7A96B","secondary":"#F4EBDD","accent":"#9A7B3F","surface":"#111111","text":"#F9F3E7"}'::jsonb,
    ARRAY['Hotels', 'Premium restaurants', 'Luxury brands', 'Real estate'],
    true
  ),
  (
    'Corporate Blue',
    'corporate-blue',
    'A clear blue-and-white system for information-rich businesses.',
    'A professional website direction using clean white surfaces, confident blues, and a readable content structure. It is intended for healthcare, education, corporate businesses, and professional organisations.',
    'Corporate',
    '{"primary":"#1769C2","secondary":"#18C7DF","accent":"#102A56","surface":"#F5F8FC","text":"#17243A"}'::jsonb,
    ARRAY['Hospitals', 'Educational institutions', 'Corporate businesses', 'Professional organisations'],
    true
  ),
  (
    'Fresh Nature',
    'fresh-nature',
    'A grounded green and cream palette with a welcoming feel.',
    'A fresh website direction combining natural greens, cream backgrounds, and soft white surfaces. It is designed as a flexible starting point for wellness, fitness, organic products, and cafes.',
    'Nature',
    '{"primary":"#3F7654","secondary":"#C5DBB8","accent":"#789765","surface":"#FFFDF8","text":"#243B2C"}'::jsonb,
    ARRAY['Organic businesses', 'Wellness', 'Fitness', 'Natural product stores', 'Cafes'],
    true
  )
ON CONFLICT (slug) DO NOTHING;

COMMIT;
