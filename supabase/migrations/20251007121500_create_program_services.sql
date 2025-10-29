-- Migration: create program_services table for dynamic services list
-- Creates table, enables RLS, adds policies, seeds initial data

create extension if not exists pgcrypto; -- for gen_random_uuid

create table if not exists public.program_services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  icon_name text not null default 'brain', -- maps to lucide-react icon key
  color_class text not null default 'bg-primary', -- tailwind color utility for icon background
  route_override text, -- if provided, overrides default route mapping
  ordering int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;$$ language plpgsql;

drop trigger if exists program_services_set_updated_at on public.program_services;
create trigger program_services_set_updated_at
before update on public.program_services
for each row execute function public.set_updated_at();

alter table public.program_services enable row level security;

-- RLS Policies
create policy "Public can read active services" on public.program_services
for select using (is_active);

create policy "Admins manage services" on public.program_services
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and coalesce(p.is_admin, false) = true
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and coalesce(p.is_admin, false) = true
  )
);

-- Seed initial data (idempotent upserts)
insert into public.program_services (slug, title, description, icon_name, color_class, route_override, ordering)
values
  ('safe-mother', 'Safe Mother', 'Program maternal (MLIPI) dengan psikoedukasi, komunitas, dan konsultasi untuk calon ibu hingga pasca melahirkan.', 'heart', 'bg-pink-500', '/safe-mother', 10),
  ('spiritual-budaya', 'Spiritual & Budaya', 'Intervensi self compassion berbasis kearifan lokal & spiritualitas Indonesia untuk kesejahteraan mental.', 'sparkles', 'bg-amber-600', '/spiritual-budaya', 20),
  ('hibrida-cbt', 'Hibrida Naratif CBT', 'Program integratif naratif + CBT untuk restrukturisasi kognitif, fleksibilitas emosi, dan rekonstruksi cerita diri.', 'brain', 'bg-indigo-600', '/hibrida-cbt', 30)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  icon_name = excluded.icon_name,
  color_class = excluded.color_class,
  route_override = excluded.route_override,
  ordering = excluded.ordering,
  is_active = true;
