-- Reader-submitted secrets. Written only by the server action with the service role key.
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  secret text not null check (char_length(secret) between 10 and 300),
  line text not null check (line in ('eat','drink','shop','go','save','whats-on','live')),
  place text not null check (char_length(place) <= 200),
  hood text check (char_length(hood) <= 60),
  how_to text check (char_length(how_to) <= 2000),
  name text check (char_length(name) <= 80),
  email text check (char_length(email) <= 200),
  status text not null default 'new' check (status in ('new','checking','published','rejected'))
);

-- RLS on with no policies: the anon key can't read or write; only the service role can.
alter table public.submissions enable row level security;
