-- Create whatsapp_sessions table
create table public.whatsapp_sessions (
    id uuid default gen_random_uuid() primary key,
    phone_number text not null unique,
    status text not null default 'collecting_facts',
    extracted_data jsonb default '{}'::jsonb,
    context_history jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.whatsapp_sessions enable row level security;

create policy "Service role can manage whatsapp sessions"
    on public.whatsapp_sessions
    for all
    to service_role
    using (true)
    with check (true);

-- Triggers
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on whatsapp_sessions
  for each row execute procedure moddatetime (updated_at);
