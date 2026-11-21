# Supabase database

The schema migration is in
[`migrations/20261121000000_npx_technology_schema.sql`](./migrations/20261121000000_npx_technology_schema.sql).
The follow-up hardening migration is
[`migrations/20261121001000_rbac_hardening.sql`](./migrations/20261121001000_rbac_hardening.sql);
apply it after the schema migration. The additive role/privilege corrections are
in [`migrations/20261121002000_rbac_privilege_corrections.sql`](./migrations/20261121002000_rbac_privilege_corrections.sql);
apply it after both preceding migrations.
It creates the profiles, enquiries, customers, projects, project milestones,
messages, payments, notifications, and activity logs tables, together with
their relationships, indexes, policies, and signup profile trigger. It does
not insert sample records. The notification guard migration
[`migrations/20261121003000_rbac_notification_guard.sql`](./migrations/20261121003000_rbac_notification_guard.sql)
is applied after all three earlier migrations. The website-theme catalog,
enquiry theme snapshots, and private preview-image bucket are added by
[`migrations/20261121004000_website_themes.sql`](./migrations/20261121004000_website_themes.sql).
That migration inserts only the six requested design-catalog entries; it does
not create customer, enquiry, project, payment, or activity records.

## Apply the migration manually

1. Back up the project database and review all migration files. The base
   schema migration is intentionally not idempotent; if any of its tables or
   named objects already exist, stop and reconcile the schema before applying
   it. Run each follow-up migration only after the base schema, in filename
   order.
2. In the Supabase Dashboard for the intended project, open **SQL Editor** and
   create a new query.
3. Paste and run the base schema migration first, followed by each RBAC,
   notification-guard, and website-themes migration in filename order, each as
   a separate query.
   The migration is not run by the application, build, or lint commands.
4. Verify the nine original tables and `website_themes` have RLS enabled,
   inspect the policies in **Database → Tables**, and confirm the
   `npx-website-theme-previews` bucket is private with its file-size and MIME
   restrictions. In **Storage → Policies**, verify that admins alone can
   upload, replace, and delete previews, while public reads are limited to
   published-theme paths and customers can read only paths saved on their own
   enquiries.
5. After a trusted user has signed up, promote the first admin from the SQL
   Editor by replacing the UUID with that user's `auth.users.id`:

   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE id = 'REPLACE-WITH-TRUSTED-USER-UUID';
   ```

   Do not promote users based on signup metadata. Later role changes should be
   made by an existing admin using
   `SELECT public.set_profile_role('TARGET-USER-UUID', 'customer');` (or
   `'admin'`). Admins cannot change their own role through that function.

Customer access is scoped to the signed-in user's profile and linked customer
record. Customers can read their own project, milestone, message, payment, and
notification records; they can submit enquiries and project messages and mark
their own unread notifications as read. The notification guard prevents
customers from changing notification identity, ownership, content, creation
time, or an existing read timestamp. Payment changes, activity logs, and all
cross-customer management are admin-only. Profile roles can only be changed by
an admin through the guarded `set_profile_role` function or by a trusted
database administrator during initial bootstrap; ordinary users cannot update
their role. The hardening migration further limits customer enquiry/message
inserts to user-supplied business fields, leaving IDs, timestamps, status, and
read state to database defaults, and removes `DELETE` on `profiles` for
authenticated users in the privilege-corrections migration. The browser-facing
app must continue using only a publishable/anon key; never put a service-role
or secret key in client configuration.

Supabase uses a shared `authenticated` database role, so the role-change RPC
has an `EXECUTE` grant for that role. Its security-definer body checks the
caller's database-backed admin profile and rejects non-admins and self-role
changes; frontend role checks are not the enforcement layer.

Website themes are readable by anonymous and authenticated users only while
published. Theme mutations and preview-image uploads, replacements, and
deletions are restricted to database-verified admins. The preview bucket is
private: published previews can be downloaded publicly through its read
policy, while an authenticated customer can continue to read a preview path
snapshotted on their own enquiry after the theme is unpublished. Enquiry theme
names, categories, palettes, and image paths are captured by a database
trigger; the client cannot write those historical snapshot fields. Anonymous
enquiry inserts are limited to public contact fields and a published theme
reference; anonymous users cannot read enquiry records. Deleting a theme sets
the live enquiry reference to null while preserving its saved historical
theme information.

## Auth configuration

The client uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the
existing `.env.local` file. Configure those values locally; the anon/publishable
key is intended for browser use and database access is still constrained by
RLS. Never put a service-role or secret key in a `VITE_` variable.

In Supabase **Authentication → URL Configuration**, set the Site URL to the
deployed app origin and add each deployed origin and local development origin
(for example `http://localhost:5173`) to the Redirect URLs allowlist. Enable
the email provider and set the password policy to at least eight characters.
Password recovery redirects to `/reset-password`; signup confirmation and
recovery email templates should link back to the configured site.

The app's signup form never sends a role. The database signup trigger creates
the profile with the `customer` default. The migration must be applied before
auth-dependent profile lookups can succeed; the frontend does not apply or
simulate the database schema.
