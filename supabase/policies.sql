-- ==========================================
-- DENUNCIA POPULAR - RLS POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE denuncias ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- FEEDBACK POLICIES
-- ==========================================

DROP POLICY IF EXISTS "Enable insert for everyone" ON feedback;
CREATE POLICY "Enable insert for everyone"
ON feedback FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON feedback;
CREATE POLICY "Enable read access for authenticated users only"
ON feedback FOR SELECT
TO authenticated
USING (true);

-- ==========================================
-- DENUNCIAS POLICIES
-- ==========================================

-- 1. SELECT: Public Read Access
DROP POLICY IF EXISTS "Public Read Access" ON denuncias;
CREATE POLICY "Public Read Access"
ON denuncias FOR SELECT
USING (true);

-- 2. INSERT: Authenticated Users Only
DROP POLICY IF EXISTS "Authenticated Users Can Insert" ON denuncias;
CREATE POLICY "Authenticated Users Can Insert"
ON denuncias FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. UPDATE: Owners Only
DROP POLICY IF EXISTS "Users Can Update Own Reports" ON denuncias;
CREATE POLICY "Users Can Update Own Reports"
ON denuncias FOR UPDATE
USING (auth.uid() = user_id);

-- 4. DELETE: Owners Only
DROP POLICY IF EXISTS "Users Can Delete Own Reports" ON denuncias;
CREATE POLICY "Users Can Delete Own Reports"
ON denuncias FOR DELETE
USING (auth.uid() = user_id);
