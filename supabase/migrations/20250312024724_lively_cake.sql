/*
  # Add Soft Delete to Goals

  1. Changes
    - Add is_deleted column to goals table
    - Update RLS policies to exclude deleted records
    - Add policy for soft delete operations

  2. Security
    - Modify existing policies to filter out deleted records
    - Add new policy for soft delete operations
*/

-- Add is_deleted column
ALTER TABLE goals
ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

-- Update existing policies to exclude deleted records
DROP POLICY IF EXISTS "Users can read their own goals" ON goals;
CREATE POLICY "Users can read their own goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND NOT is_deleted);

DROP POLICY IF EXISTS "Users can update their own goals" ON goals;
CREATE POLICY "Users can update their own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND NOT is_deleted)
  WITH CHECK (auth.uid() = user_id);

-- Add policy for soft delete operations
CREATE POLICY "Users can soft delete their own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    AND is_deleted = true 
    AND (SELECT is_deleted FROM goals WHERE id = goals.id) = false
  );