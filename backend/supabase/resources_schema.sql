-- Supabase schema for resources consumed by GET /api/resources
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (
    category in (
      'legal',
      'healthcare',
      'immigration',
      'education',
      'community',
      'social_life',
      'financial_aid',
      'language_learning',
      'business'
    )
  ),
  description text not null,
  tags text[] not null default '{}',
  rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  open_now boolean not null default false,
  verified boolean not null default false,
  distance_label text not null default '',
  address text not null default '',
  city text,
  phone text not null default '',
  website text not null default '',
  languages text[] not null default '{}',
  image_url text not null default '',
  last_updated date not null default current_date,
  source_url text,
  eligibility text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resources_category_idx on public.resources (category);
create index if not exists resources_city_idx on public.resources (city);
create index if not exists resources_languages_gin_idx on public.resources using gin (languages);
create index if not exists resources_tags_gin_idx on public.resources using gin (tags);

alter table public.resources enable row level security;

-- API uses service-role key, so this read policy is optional for backend access,
-- but useful if anon client reads are needed later.
drop policy if exists "Allow anon read resources" on public.resources;
create policy "Allow anon read resources"
  on public.resources
  for select
  to anon
  using (true);

insert into public.resources (
  name,
  category,
  description,
  tags,
  rating,
  open_now,
  verified,
  distance_label,
  address,
  city,
  phone,
  website,
  languages,
  image_url,
  last_updated,
  source_url
)
values
  (
    'Centro Esperanza Legal Clinic',
    'legal',
    'Consultas legales asequibles con orientacion clara para familias inmigrantes y citas bilingues.',
    array['Trusted partner', 'Low-cost consult', 'Family cases'],
    4.8,
    true,
    true,
    '1.2 mi',
    '2540 W 26th St, Chicago, IL',
    'Chicago',
    '(312) 555-0142',
    'https://example.org/esperanza',
    array['Español', 'English'],
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
    '2026-02-11',
    'https://example.org/esperanza'
  ),
  (
    'Salud Para Todos Community Health',
    'healthcare',
    'Atencion primaria, vacunas y apoyo prenatal con tarifas segun ingresos y personal hispanohablante.',
    array['Open evenings', 'Walk-ins', 'Pediatric care'],
    4.7,
    true,
    true,
    '2.8 mi',
    '1938 S Blue Island Ave, Chicago, IL',
    'Chicago',
    '(773) 555-0891',
    'https://example.org/salud',
    array['Español', 'English'],
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    '2026-02-09',
    'https://example.org/salud'
  )
on conflict do nothing;
