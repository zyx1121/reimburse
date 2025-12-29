-- Update RLS policies to allow unauthenticated users to query records with user_id IS NULL
-- This is necessary for initialization data and shared records

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own egress records" ON egress;
DROP POLICY IF EXISTS "Users can insert their own egress records" ON egress;
DROP POLICY IF EXISTS "Users can update their own egress records" ON egress;
DROP POLICY IF EXISTS "Users can delete their own egress records" ON egress;

DROP POLICY IF EXISTS "Users can view their own ingress records" ON ingress;
DROP POLICY IF EXISTS "Users can insert their own ingress records" ON ingress;
DROP POLICY IF EXISTS "Users can update their own ingress records" ON ingress;
DROP POLICY IF EXISTS "Users can delete their own ingress records" ON ingress;

-- Egress policies
-- Allow viewing records where user_id IS NULL (shared records) or user_id matches authenticated user
CREATE POLICY "Allow viewing egress records"
  ON egress FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Allow inserting records where user_id IS NULL or matches authenticated user
CREATE POLICY "Allow inserting egress records"
  ON egress FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Allow updating records where user_id IS NULL or matches authenticated user
CREATE POLICY "Allow updating egress records"
  ON egress FOR UPDATE
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Allow deleting records where user_id IS NULL or matches authenticated user
CREATE POLICY "Allow deleting egress records"
  ON egress FOR DELETE
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Ingress policies
-- Allow viewing records where user_id IS NULL (shared records) or user_id matches authenticated user
CREATE POLICY "Allow viewing ingress records"
  ON ingress FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Allow inserting records where user_id IS NULL or matches authenticated user
CREATE POLICY "Allow inserting ingress records"
  ON ingress FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Allow updating records where user_id IS NULL or matches authenticated user
CREATE POLICY "Allow updating ingress records"
  ON ingress FOR UPDATE
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Allow deleting records where user_id IS NULL or matches authenticated user
CREATE POLICY "Allow deleting ingress records"
  ON ingress FOR DELETE
  USING (user_id IS NULL OR auth.uid() = user_id);

