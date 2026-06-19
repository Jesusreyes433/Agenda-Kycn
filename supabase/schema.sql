-- Agenda Kycn - esquema de base de datos para Supabase
-- Ejecutar este archivo completo en: Supabase Dashboard > SQL Editor > New query

create extension if not exists "pgcrypto";

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#0F2540',
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references team_members(id) on delete cascade,
  title text not null,
  notes text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint appointments_end_after_start check (end_at > start_at)
);

create index if not exists appointments_start_at_idx on appointments (start_at);
create index if not exists appointments_member_id_idx on appointments (member_id);

-- Row Level Security
-- Nota de seguridad: esta app identifica personas solo por nombre (sin
-- contraseña), pensada para un equipo interno y de confianza. Las políticas
-- de abajo permiten leer y escribir con la llave "anon" pública. Cualquiera
-- que tenga el link de la app puede crear/editar/borrar registros. Si en el
-- futuro se necesita más seguridad, migrar a Supabase Auth (email/password
-- o magic link) y restringir las políticas de escritura a auth.uid().

alter table team_members enable row level security;
alter table appointments enable row level security;

create policy "team_members_select_all" on team_members
  for select using (true);

create policy "team_members_insert_all" on team_members
  for insert with check (true);

create policy "appointments_select_all" on appointments
  for select using (true);

create policy "appointments_insert_all" on appointments
  for insert with check (true);

create policy "appointments_update_all" on appointments
  for update using (true);

create policy "appointments_delete_all" on appointments
  for delete using (true);

-- Habilitar Realtime para que todo el equipo vea los cambios al instante
alter publication supabase_realtime add table appointments;
alter publication supabase_realtime add table team_members;
