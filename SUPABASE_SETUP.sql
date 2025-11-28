-- 1. Create the 'evidence' bucket for file storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up Storage Policies (Allow public upload and read)
-- Policy: Allow public read access (necessary for viewing evidence in dashboard/PDF)
CREATE POLICY "Public Access Evidence"
ON storage.objects FOR SELECT
USING ( bucket_id = 'evidence' );

-- Policy: Allow public upload access (necessary for anonymous users)
CREATE POLICY "Public Upload Evidence"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'evidence' );

-- 3. Enable Row Level Security (RLS) on the main table
ALTER TABLE denuncias ENABLE ROW LEVEL SECURITY;

-- 4. Set up Table Policies
-- Policy: Allow anyone to INSERT a new complaint (Anonymous & Registered)
CREATE POLICY "Enable insert for everyone"
ON denuncias FOR INSERT
WITH CHECK ( true );

-- Note: We do NOT add a SELECT policy for 'anon'. 
-- This ensures that regular users cannot query the database to see other complaints.
-- Only the 'service_role' (Admin/Dashboard) will be able to read the data.
