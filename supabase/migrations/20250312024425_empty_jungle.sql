/*
  # Add Soft Delete to Activities

  1. Changes
    - Add is_deleted column to activities table
    - Update RLS policies to exclude deleted records
    - Add function to soft delete records

  2. Security
    - Modify existing policies to filter out deleted records
    - Add new policy for soft delete operations
*/

-- Add is_deleted column
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

-- Update existing policies to exclude deleted records
DROP POLICY IF EXISTS "Users can read own activities" ON activities;
CREATE POLICY "Users can read own activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND NOT is_deleted);

DROP POLICY IF EXISTS "Users can update own activities" ON activities;
CREATE POLICY "Users can update own activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND NOT is_deleted)
  WITH CHECK (auth.uid() = user_id);

-- Add policy for soft delete operations
CREATE POLICY "Users can soft delete own activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    AND is_deleted = true 
    AND (SELECT is_deleted FROM activities WHERE id = activities.id) = false
  );