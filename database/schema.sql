-- Canonical schema — migration files are historical.
-- Combined schema including all migrations up to v7.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- MOTORCYCLE CATALOG (Reference Data)
create table public.motorcycle_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year_from INTEGER,
    year_to INTEGER,
    category TEXT,
    engine_cc INTEGER,
    updated_at BIGINT DEFAULT extract(epoch from now()) * 1000,
    UNIQUE(brand, model)
);

-- VEHICLES
create table public.vehicles (
  id text primary key,
  user_id UUID REFERENCES auth.users(id),
  brand text not null,
  model text not null,
  vin text,
  year integer,
  current_mileage integer not null default 0,
  display_order integer default 0,
  catalog_id UUID REFERENCES public.motorcycle_catalog(id),
  created_at bigint default extract(epoch from now()) * 1000,
  updated_at bigint default extract(epoch from now()) * 1000,
  deleted_at bigint -- Soft delete for sync
);

-- MAINTENANCE LOGS
create table public.maintenance_logs (
  id text primary key,
  user_id UUID REFERENCES auth.users(id),
  title text not null,
  type text not null,
  cost integer default 0, -- Stored in whole currency units (euros)
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
  user_id UUID REFERENCES auth.users(id),
  type text not null,
  reference text,
  expiry_date bigint,
  local_uri text, 
  remote_path text, 
  vehicle_id text references public.vehicles(id), 
  log_id text references public.maintenance_logs(id) on delete set null,
  created_at bigint default extract(epoch from now()) * 1000,
  updated_at bigint default extract(epoch from now()) * 1000,
  deleted_at bigint
);

-- DOCUMENT PAGES
create table public.document_pages (
    id text primary key,
    document_id text references public.documents(id) on delete cascade not null,
    page_index integer not null,
    local_uri text,
    remote_path text,
    width integer,
    height integer,
    created_at bigint default extract(epoch from now()) * 1000,
    updated_at bigint default extract(epoch from now()) * 1000,
    deleted_at bigint
);

-- INDEXES for Sync Performance
create index vehicles_updated_at_idx on public.vehicles(updated_at);
create index maintenance_logs_updated_at_idx on public.maintenance_logs(updated_at);
create index documents_updated_at_idx on public.documents(updated_at);
create index document_pages_updated_at_idx on public.document_pages(updated_at);

create index maintenance_logs_vehicle_id_idx on public.maintenance_logs(vehicle_id);
create index documents_vehicle_id_idx on public.documents(vehicle_id);
create index document_pages_document_id_idx on public.document_pages(document_id);

create index motorcycle_catalog_brand_idx on public.motorcycle_catalog(brand);
create index motorcycle_catalog_brand_model_idx on public.motorcycle_catalog(brand, model);

-- RLS (Row Level Security)
alter table public.motorcycle_catalog enable row level security;
alter table public.vehicles enable row level security;
alter table public.maintenance_logs enable row level security;
alter table public.documents enable row level security;
alter table public.document_pages enable row level security;

-- Policies for motorcycle_catalog
create policy "Public read" on public.motorcycle_catalog for select using (true);

-- Policies for vehicles
create policy "Users can select their own vehicles" on public.vehicles for select using (auth.uid() = user_id);
create policy "Users can insert their own vehicles" on public.vehicles for insert with check (auth.uid() = user_id);
create policy "Users can update their own vehicles" on public.vehicles for update using (auth.uid() = user_id);
create policy "Users can delete their own vehicles" on public.vehicles for delete using (auth.uid() = user_id);

-- Policies for maintenance_logs
create policy "Users can select their own logs" on public.maintenance_logs for select using (auth.uid() = user_id);
create policy "Users can insert their own logs" on public.maintenance_logs for insert with check (auth.uid() = user_id);
create policy "Users can update their own logs" on public.maintenance_logs for update using (auth.uid() = user_id);
create policy "Users can delete their own logs" on public.maintenance_logs for delete using (auth.uid() = user_id);

-- Policies for documents
create policy "Users can select their own documents" on public.documents for select using (auth.uid() = user_id);
create policy "Users can insert their own documents" on public.documents for insert with check (auth.uid() = user_id);
create policy "Users can update their own documents" on public.documents for update using (auth.uid() = user_id);
create policy "Users can delete their own documents" on public.documents for delete using (auth.uid() = user_id);

-- Policies for document_pages
create policy "Users can select their own document pages" on public.document_pages 
  for select using (exists (select 1 from public.documents d where d.id = document_pages.document_id and d.user_id = auth.uid()));
create policy "Users can insert their own document pages" on public.document_pages 
  for insert with check (exists (select 1 from public.documents d where d.id = document_pages.document_id and d.user_id = auth.uid()));
create policy "Users can update their own document pages" on public.document_pages 
  for update using (exists (select 1 from public.documents d where d.id = document_pages.document_id and d.user_id = auth.uid()));
create policy "Users can delete their own document pages" on public.document_pages 
  for delete using (exists (select 1 from public.documents d where d.id = document_pages.document_id and d.user_id = auth.uid()));
