-- Migration: Add multi-system role management
-- This migration adds a roles JSONB column to user_profiles table
-- Format: {"bento": ["admin"], "reimburse": ["user"], "img": ["admin"]}
-- All systems use only 'admin' and 'user' roles

-- Add roles column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS roles JSONB DEFAULT '{}'::jsonb;

-- Create index for efficient role queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_roles ON public.user_profiles USING GIN (roles);

-- Create a function to check if user has a specific role in a system
CREATE OR REPLACE FUNCTION has_role(
  user_id_param UUID,
  system_name TEXT,
  role_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  user_roles JSONB;
BEGIN
  SELECT roles INTO user_roles
  FROM public.user_profiles
  WHERE id = user_id_param;

  IF user_roles IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if the role exists in the system's role array
  RETURN (
    user_roles ? system_name AND
    (user_roles->system_name)::jsonb ? role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user has any role in a system
CREATE OR REPLACE FUNCTION has_any_role_in_system(
  user_id_param UUID,
  system_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  user_roles JSONB;
BEGIN
  SELECT roles INTO user_roles
  FROM public.user_profiles
  WHERE id = user_id_param;

  IF user_roles IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN user_roles ? system_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migrate existing is_admin to roles
-- Set is_admin users as admin in all three systems
-- All systems use 'admin' and 'user' roles only
UPDATE public.user_profiles
SET roles = jsonb_build_object(
  'bento', CASE WHEN is_admin THEN to_jsonb(ARRAY['admin']) ELSE to_jsonb(ARRAY['user']) END,
  'reimburse', CASE WHEN is_admin THEN to_jsonb(ARRAY['admin']) ELSE to_jsonb(ARRAY['user']) END,
  'img', CASE WHEN is_admin THEN to_jsonb(ARRAY['admin']) ELSE to_jsonb(ARRAY['user']) END
)
WHERE roles = '{}'::jsonb OR roles IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.user_profiles.roles IS 'Multi-system role management. Format: {"system_name": ["role"]}. All systems use only "admin" and "user" roles. Example: {"bento": ["admin"], "reimburse": ["user"], "img": ["admin"]}';
COMMENT ON FUNCTION has_role(UUID, TEXT, TEXT) IS 'Check if a user has a specific role in a system';
COMMENT ON FUNCTION has_any_role_in_system(UUID, TEXT) IS 'Check if a user has any role in a system';

