-- Allow everyone (including unauthenticated users) to view all records
-- This removes the user_id restriction for viewing

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Allow viewing egress records" ON egress;
DROP POLICY IF EXISTS "Allow viewing ingress records" ON ingress;

-- Create new policies that allow everyone to view all records
CREATE POLICY "Allow viewing all egress records"
  ON egress FOR SELECT
  USING (true);

CREATE POLICY "Allow viewing all ingress records"
  ON ingress FOR SELECT
  USING (true);

