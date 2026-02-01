-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- VEHICLES
create table public.vehicles (
  id text primary key,
  brand text not null,
  model text not null,
  vin text,
  year integer,
  current_mileage integer not null default 0,
  created_at bigint default extract(epoch from now()) * 1000,
  updated_at bigint default extract(epoch from now()) * 1000,
  deleted_at bigint -- Soft delete for sync
);

-- MAINTENANCE LOGS
create table public.maintenance_logs (
  id text primary key,
  title text not null,
  type text not null,
  cost integer default 0,
  mileage_at_log integer not null,
  date bigint not null,
  vehicle_id text references public.vehicles(id) not null,
  notes text,
  created_at bigint default extract(epoch from now()) * 1000,
  updated_at bigint default extract(epoch from now()) * 1000,
  deleted_at bigint
);

-- DOCUMENTS
create table public.documents (
  id text primary key,
  type text not null,
  reference text,
  expiry_date bigint,
  local_uri text, -- Keeps local path info if needed, though mostly relevant on client
  remote_path text, -- Path in Supabase Storage
  vehicle_id text references public.vehicles(id), -- Optional: NULL for user-level docs (license)
  log_id text references public.maintenance_logs(id),
  created_at bigint default extract(epoch from now()) * 1000,
  updated_at bigint default extract(epoch from now()) * 1000,
  deleted_at bigint
);

-- INDEXES for Sync Performance
create index vehicles_updated_at_idx on public.vehicles(updated_at);
create index maintenance_logs_updated_at_idx on public.maintenance_logs(updated_at);
create index documents_updated_at_idx on public.documents(updated_at);

create index maintenance_logs_vehicle_id_idx on public.maintenance_logs(vehicle_id);
create index documents_vehicle_id_idx on public.documents(vehicle_id);

-- RLS (Row Level Security) - Simplified for now, but crucial
alter table public.vehicles enable row level security;
alter table public.maintenance_logs enable row level security;
alter table public.documents enable row level security;

-- Policies (Placeholder: Allow all for authenticated users for now)
-- In production, restrict to user_id = auth.uid()
create policy "Enable all access for authenticated users" on public.vehicles
  for all using (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users" on public.maintenance_logs
  for all using (auth.role() = 'authenticated');
  
create policy "Enable all access for authenticated users" on public.documents
  for all using (auth.role() = 'authenticated');

-- Function to handle handle updated_at automatically? 
-- WatermelonDB usually sends updated_at, so maybe not strictly needed if client is source of truth,
-- but good practice for server-side edits.
