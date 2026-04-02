-- ============================================
-- FIX: documents.log_id FK constraint
-- Allows deleting maintenance_log while keeping or deleting the document
-- ============================================

-- Drop the existing foreign key constraint
ALTER TABLE public.documents 
DROP CONSTRAINT IF EXISTS documents_log_id_fkey;

-- Re-add with ON DELETE SET NULL behavior
ALTER TABLE public.documents 
ADD CONSTRAINT documents_log_id_fkey 
FOREIGN KEY (log_id) 
REFERENCES public.maintenance_logs(id) 
ON DELETE SET NULL;

-- ============================================
-- RLS POLICIES (existing migration)
-- ============================================

-- 1. Enable RLS on all tables (if not already done)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 2. Add user_id column if missing (safe execution)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'user_id') THEN
        ALTER TABLE vehicles ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_logs' AND column_name = 'user_id') THEN
        ALTER TABLE maintenance_logs ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'user_id') THEN
        ALTER TABLE documents ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 3. Create Policy: Users can only see their own data
-- Drop existing policies first to ensure clean state
DROP POLICY IF EXISTS "Users can select their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can insert their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can update their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can delete their own vehicles" ON vehicles;

CREATE POLICY "Users can select their own vehicles" ON vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vehicles" ON vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vehicles" ON vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vehicles" ON vehicles FOR DELETE USING (auth.uid() = user_id);

-- Apply similar policies for logs and documents
DROP POLICY IF EXISTS "Users can select their own logs" ON maintenance_logs;
DROP POLICY IF EXISTS "Users can insert their own logs" ON maintenance_logs;
DROP POLICY IF EXISTS "Users can update their own logs" ON maintenance_logs;
DROP POLICY IF EXISTS "Users can delete their own logs" ON maintenance_logs;

CREATE POLICY "Users can select their own logs" ON maintenance_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own logs" ON maintenance_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own logs" ON maintenance_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own logs" ON maintenance_logs FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can select their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;

CREATE POLICY "Users can select their own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON documents FOR DELETE USING (auth.uid() = user_id);

-- 4. OPTIONAL: Fix Ghost Data (Assign NULL user_id records to the CURRENTLY logged in admin or just leave them null/invisible)
-- If you want to delete all "ghost" data (created before auth):
-- DELETE FROM vehicles WHERE user_id IS NULL;
-- DELETE FROM maintenance_logs WHERE user_id IS NULL;
-- DELETE FROM documents WHERE user_id IS NULL;
