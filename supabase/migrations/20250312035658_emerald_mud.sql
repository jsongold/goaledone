/*
  # Fix RLS Policies for Activities

  1. Changes
    - Simplify RLS policies to fix permission issues
    - Ensure proper handling of is_deleted flag
    - Fix policy conditions for better clarity

  2. Security
    - Maintain user data isolation
    - Allow proper CRUD operations
*/

-- Drop existing activities policies
DROP POLICY IF EXISTS "Users can insert own activities" ON activities;
DROP POLICY IF EXISTS "Users can read own activities" ON activities;
DROP POLICY IF EXISTS "Users can update own activities" ON activities;
DROP POLICY IF EXISTS "Users can soft delete own activities" ON activities;

-- Create simplified policies
CREATE POLICY "Users can insert own activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add default value for is_deleted if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'activities' 
    AND column_name = 'is_deleted' 
    AND column_default = 'false'
  ) THEN
    ALTER TABLE activities 
    ALTER COLUMN is_deleted SET DEFAULT false;
  END IF;
END $$;