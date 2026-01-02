-- Ensure unauthenticated users can view records with user_id IS NULL
-- This migration makes the RLS policies more explicit for anonymous access

-- Drop and recreate egress policies with explicit anonymous access
DROP POLICY IF EXISTS "Allow viewing egress records" ON egress;
DROP POLICY IF EXISTS "Allow inserting egress records" ON egress;
DROP POLICY IF EXISTS "Allow updating egress records" ON egress;
DROP POLICY IF EXISTS "Allow deleting egress records" ON egress;

-- Egress SELECT: Allow viewing records where user_id IS NULL (anyone can view) OR user_id matches authenticated user
CREATE POLICY "Allow viewing egress records"
  ON egress FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Egress INSERT: Allow inserting records where user_id IS NULL or matches authenticated user
CREATE POLICY "Allow inserting egress records"
  ON egress FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Egress UPDATE: Allow updating records where user_id IS NULL or matches authenticated user
CREATE POLICY "Allow updating egress records"
  ON egress FOR UPDATE
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Egress DELETE: Allow deleting records where user_id IS NULL or matches authenticated user
CREATE POLICY "Allow deleting egress records"
  ON egress FOR DELETE
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Drop and recreate ingress policies with explicit anonymous access
DROP POLICY IF EXISTS "Allow viewing ingress records" ON ingress;
DROP POLICY IF EXISTS "Allow inserting ingress records" ON ingress;
DROP POLICY IF EXISTS "Allow updating ingress records" ON ingress;
DROP POLICY IF EXISTS "Allow deleting ingress records" ON ingress;

-- Ingress SELECT: Allow viewing records where user_id IS NULL (anyone can view) OR user_id matches authenticated user
CREATE POLICY "Allow viewing ingress records"
  ON ingress FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Ingress INSERT: Allow inserting records where user_id IS NULL or matches authenticated user
CREATE POLICY "Allow inserting ingress records"
  ON ingress FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Ingress UPDATE: Allow updating records where user_id IS NULL or matches authenticated user
CREATE POLICY "Allow updating ingress records"
  ON ingress FOR UPDATE
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Ingress DELETE: Allow deleting records where user_id IS NULL or matches authenticated user
CREATE POLICY "Allow deleting ingress records"
  ON ingress FOR DELETE
  USING (user_id IS NULL OR auth.uid() = user_id);

