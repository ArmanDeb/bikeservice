-- supabase_migration_v7.sql

-- 1. Add display_order to vehicles
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'display_order') THEN
        ALTER TABLE public.vehicles ADD COLUMN display_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Create motorcycle_catalog table
CREATE TABLE IF NOT EXISTS public.motorcycle_catalog (
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

-- Public read, no RLS needed (reference data)
ALTER TABLE public.motorcycle_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.motorcycle_catalog;
CREATE POLICY "Public read" ON public.motorcycle_catalog FOR SELECT USING (true);

-- 3. Add catalog_id to vehicles
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'catalog_id') THEN
        ALTER TABLE public.vehicles ADD COLUMN catalog_id UUID REFERENCES public.motorcycle_catalog(id);
    END IF;
END $$;

-- 4. Create document_pages table
CREATE TABLE IF NOT EXISTS public.document_pages (
    id TEXT PRIMARY KEY,
    document_id TEXT REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    page_index INTEGER NOT NULL,
    local_uri TEXT,
    remote_path TEXT,
    created_at BIGINT DEFAULT extract(epoch from now()) * 1000,
    updated_at BIGINT DEFAULT extract(epoch from now()) * 1000,
    deleted_at BIGINT
);

-- 5. Indexes for Sync Performance
CREATE INDEX IF NOT EXISTS document_pages_updated_at_idx ON public.document_pages(updated_at);
CREATE INDEX IF NOT EXISTS document_pages_document_id_idx ON public.document_pages(document_id);
CREATE INDEX IF NOT EXISTS motorcycle_catalog_brand_idx ON public.motorcycle_catalog(brand);
CREATE INDEX IF NOT EXISTS motorcycle_catalog_brand_model_idx ON public.motorcycle_catalog(brand, model);

-- 6. RLS for document_pages
ALTER TABLE public.document_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select their own document pages" ON public.document_pages;
CREATE POLICY "Users can select their own document pages" ON public.document_pages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_pages.document_id AND d.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own document pages" ON public.document_pages;
CREATE POLICY "Users can insert their own document pages" ON public.document_pages 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_pages.document_id AND d.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own document pages" ON public.document_pages;
CREATE POLICY "Users can update their own document pages" ON public.document_pages 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_pages.document_id AND d.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own document pages" ON public.document_pages;
CREATE POLICY "Users can delete their own document pages" ON public.document_pages 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_pages.document_id AND d.user_id = auth.uid()
    )
  );

-- 7. Add Comment on maintenance_logs.cost
COMMENT ON COLUMN public.maintenance_logs.cost IS 'Stored in whole currency units (euros)';

-- 8. Drop old placeholder RLS policies from supabase_schema.sql if they still exist
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.vehicles;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.maintenance_logs;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.documents;
