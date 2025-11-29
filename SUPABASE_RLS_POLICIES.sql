-- ==========================================
-- ENHANCED ROW LEVEL SECURITY (RLS) POLICIES
-- For the 'denuncias' (reports) table
-- ==========================================

-- First, ensure RLS is enabled
ALTER TABLE denuncias ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 1. SELECT Policy: Public Read Access
-- ==========================================
-- Goal: Everyone (authenticated and anonymous) can view all reports
-- This allows the map to display all public reports

DROP POLICY IF EXISTS "Public Read Access" ON denuncias;

CREATE POLICY "Public Read Access"
ON denuncias
FOR SELECT
USING (true);

-- Explanation: USING (true) means no restrictions on SELECT queries.
-- Both authenticated users and anonymous visitors can read all reports.

-- ==========================================
-- 2. INSERT Policy: Authenticated Users Only
-- ==========================================
-- Goal: Only authenticated users can create new reports
-- This prevents spam and ensures accountability

DROP POLICY IF EXISTS "Authenticated Users Can Insert" ON denuncias;

CREATE POLICY "Authenticated Users Can Insert"
ON denuncias
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Explanation: auth.uid() IS NOT NULL checks if the user is authenticated.
-- Anonymous users (where auth.uid() is NULL) will be blocked from inserting.

-- NOTE: If you want to allow anonymous reports, change this to:
-- WITH CHECK (true);

-- ==========================================
-- 3. UPDATE Policy: DISABLED
-- ==========================================
-- Goal: Prevent modification after submission for integrity
-- Users cannot update their reports once submitted.

DROP POLICY IF EXISTS "Users Can Update Own Reports" ON denuncias;

-- CREATE POLICY "Users Can Update Own Reports"
-- ON denuncias
-- FOR UPDATE
-- USING (auth.uid() = user_id);

-- ==========================================
-- 4. DELETE Policy: DISABLED
-- ==========================================
-- Goal: Prevent deletion for integrity

DROP POLICY IF EXISTS "Users Can Delete Own Reports" ON denuncias;

-- CREATE POLICY "Users Can Delete Own Reports"
-- ON denuncias
-- FOR DELETE
-- USING (auth.uid() = user_id);

-- ==========================================
-- 5. AUTO-POPULATE user_id ON INSERT
-- ==========================================
-- Create a trigger to automatically set user_id when a new report is inserted

CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_user_id_on_insert ON denuncias;

CREATE TRIGGER set_user_id_on_insert
BEFORE INSERT ON denuncias
FOR EACH ROW
EXECUTE FUNCTION set_user_id();

-- ==========================================
-- SUMMARY
-- ==========================================
-- 1. SELECT: Everyone can view (public map)
-- 2. INSERT: Only authenticated users (prevents spam)
-- 3. UPDATE: Only report owner
-- 4. DELETE: Only report owner
-- 5. user_id is auto-populated on insert
