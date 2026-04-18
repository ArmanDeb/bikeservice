-- ============================================================
-- BikeService — Database Schema (production snapshot)
-- Last updated: 2026-04-10
-- Project: bizihpiomnjtkgmcpxln (Supabase EU West 2)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- VEHICLES
CREATE TABLE public.vehicles (
    id               text        PRIMARY KEY,
    brand            text        NOT NULL,
    model            text        NOT NULL,
    vin              text,
    year             integer,
    current_mileage  integer     NOT NULL DEFAULT 0,
    display_order    integer     DEFAULT 0,
    catalog_id       uuid        REFERENCES public.motorcycle_catalog(id),
    user_id          uuid        REFERENCES auth.users(id),
    created_at       bigint      DEFAULT (EXTRACT(EPOCH FROM now()) * 1000),
    updated_at       bigint      DEFAULT (EXTRACT(EPOCH FROM now()) * 1000),
    deleted_at       bigint      -- soft delete for sync
);

-- MAINTENANCE LOGS
CREATE TABLE public.maintenance_logs (
    id              text        PRIMARY KEY,
    title           text        NOT NULL,
    type            text        NOT NULL,
    cost            numeric     DEFAULT 0,
    mileage_at_log  integer     NOT NULL,
    date            bigint      NOT NULL,
    vehicle_id      text        NOT NULL REFERENCES public.vehicles(id),
    notes           text,
    user_id         uuid        REFERENCES auth.users(id),
    created_at      bigint      DEFAULT (EXTRACT(EPOCH FROM now()) * 1000),
    updated_at      bigint      DEFAULT (EXTRACT(EPOCH FROM now()) * 1000),
    deleted_at      bigint
);

-- DOCUMENTS
CREATE TABLE public.documents (
    id           text    PRIMARY KEY,
    type         text    NOT NULL,
    reference    text,
    expiry_date  bigint,
    local_uri    text,
    remote_path  text,
    vehicle_id   text    REFERENCES public.vehicles(id),
    log_id       text    REFERENCES public.maintenance_logs(id) ON DELETE SET NULL,
    user_id      uuid    REFERENCES auth.users(id),
    created_at   bigint  DEFAULT (EXTRACT(EPOCH FROM now()) * 1000),
    updated_at   bigint  DEFAULT (EXTRACT(EPOCH FROM now()) * 1000),
    deleted_at   bigint
);

-- DOCUMENT PAGES (multi-page document support)
CREATE TABLE public.document_pages (
    id           text     PRIMARY KEY,
    document_id  text     NOT NULL REFERENCES public.documents(id),
    page_index   integer  NOT NULL,
    local_uri    text,
    remote_path  text,
    width        integer,
    height       integer,
    created_at   bigint   DEFAULT (EXTRACT(EPOCH FROM now()) * 1000),
    updated_at   bigint   DEFAULT (EXTRACT(EPOCH FROM now()) * 1000),
    deleted_at   bigint
);

-- MOTORCYCLE CATALOG (read-only reference data)
CREATE TABLE public.motorcycle_catalog (
    id          uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand       text    NOT NULL,
    model       text    NOT NULL,
    year_from   integer,
    year_to     integer,
    category    text,
    engine_cc   integer,
    updated_at  bigint  DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX vehicles_updated_at_idx          ON public.vehicles(updated_at);
CREATE INDEX vehicles_user_id_idx             ON public.vehicles(user_id);

CREATE INDEX maintenance_logs_updated_at_idx  ON public.maintenance_logs(updated_at);
CREATE INDEX maintenance_logs_vehicle_id_idx  ON public.maintenance_logs(vehicle_id);
CREATE INDEX maintenance_logs_user_id_idx     ON public.maintenance_logs(user_id);

CREATE INDEX documents_updated_at_idx         ON public.documents(updated_at);
CREATE INDEX documents_vehicle_id_idx         ON public.documents(vehicle_id);
CREATE INDEX documents_user_id_idx            ON public.documents(user_id);

CREATE INDEX document_pages_document_id_idx   ON public.document_pages(document_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.vehicles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_pages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motorcycle_catalog ENABLE ROW LEVEL SECURITY;

-- VEHICLES
CREATE POLICY "Users can select their own vehicles" ON public.vehicles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vehicles" ON public.vehicles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vehicles" ON public.vehicles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vehicles" ON public.vehicles
    FOR DELETE USING (auth.uid() = user_id);

-- MAINTENANCE LOGS
CREATE POLICY "Users can select their own logs" ON public.maintenance_logs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own logs" ON public.maintenance_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own logs" ON public.maintenance_logs
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own logs" ON public.maintenance_logs
    FOR DELETE USING (auth.uid() = user_id);

-- DOCUMENTS
CREATE POLICY "Users can select their own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.documents
    FOR DELETE USING (auth.uid() = user_id);

-- DOCUMENT PAGES (access via parent document ownership)
CREATE POLICY "Users can select their own document pages" ON public.document_pages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_pages.document_id AND d.user_id = auth.uid())
    );
CREATE POLICY "Users can insert their own document pages" ON public.document_pages
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_pages.document_id AND d.user_id = auth.uid())
    );
CREATE POLICY "Users can update their own document pages" ON public.document_pages
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_pages.document_id AND d.user_id = auth.uid())
    );
CREATE POLICY "Users can delete their own document pages" ON public.document_pages
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_pages.document_id AND d.user_id = auth.uid())
    );

-- MOTORCYCLE CATALOG (public read-only)
CREATE POLICY "Public read" ON public.motorcycle_catalog
    FOR SELECT USING (true);

-- ============================================================
-- STORAGE — bucket: documents
-- (private bucket, policies scoped to auth.uid() via folder name)
-- ============================================================
-- INSERT: bucket_id = 'documents' AND auth.uid()::text = storage.foldername(name)[1]
-- SELECT: bucket_id = 'documents' AND auth.uid()::text = storage.foldername(name)[1]
-- UPDATE: bucket_id = 'documents' AND auth.uid()::text = storage.foldername(name)[1]
-- DELETE: bucket_id = 'documents' AND auth.uid()::text = storage.foldername(name)[1]
