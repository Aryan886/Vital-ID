-- Support patient signup provisioning from FastAPI.
-- Safe to re-run: changes are guarded where PostgreSQL supports it.

alter table public.profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists role text default 'patient',
  add column if not exists created_at timestamptz not null default now();

alter table public.patients
  add column if not exists user_id uuid references public.profiles (id) on delete cascade,
  add column if not exists vital_id text,
  add column if not exists full_name text,
  add column if not exists role text default 'patient',
  add column if not exists blood_group text,
  add column if not exists allergies text[] default '{}'::text[],
  add column if not exists conditions text[] default '{}'::text[],
  add column if not exists vaccinations text[] default '{}'::text[],
  add column if not exists dob date,
  add column if not exists emergency_contact text,
  add column if not exists insurance_provider text,
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists idx_patients_vital_id_unique
  on public.patients (vital_id)
  where vital_id is not null;

create index if not exists idx_patients_user_id
  on public.patients (user_id);

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('patient', 'doctor', 'admin'));

alter table public.patients
  drop constraint if exists patients_role_check;

alter table public.patients
  add constraint patients_role_check
  check (role is null or role in ('patient', 'doctor', 'admin'));

-- FastAPI signup uses the service role, but these policies keep the schema
-- compatible with future authenticated client-side self-provisioning.

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.patient_visibility_settings enable row level security;

drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and role = 'patient'
);

drop policy if exists "patients_self_insert" on public.patients;
create policy "patients_self_insert"
on public.patients
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "visibility_self_insert" on public.patient_visibility_settings;
create policy "visibility_self_insert"
on public.patient_visibility_settings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.patients patient
    where patient.id = patient_visibility_settings.patient_id
      and patient.user_id = auth.uid()
  )
);

-- Optional after confirming existing profile ids are auth.users ids:
--
-- alter table public.profiles
--   add constraint profiles_id_auth_users_fkey
--   foreign key (id)
--   references auth.users (id)
--   on delete cascade;
