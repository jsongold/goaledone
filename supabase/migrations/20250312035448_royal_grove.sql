/*
  # Fix Activities RLS Policies

  1. Changes
    - Drop existing RLS policies
    - Create new, more permissive policies that allow all required fields
    - Ensure policies handle soft deletion correctly

  2. Security
    - Maintain user data isolation
    - Allow users to manage their own activities
    - Prevent access to deleted records
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own activities" ON activities;
DROP POLICY IF EXISTS "Users can read own activities" ON activities;
DROP POLICY IF EXISTS "Users can update own activities" ON activities;
DROP POLICY IF EXISTS "Users can soft delete own activities" ON activities;

-- Create new policies
CREATE POLICY "Users can insert own activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT is_deleted
  );

CREATE POLICY "Users can read own activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND NOT is_deleted
  );

CREATE POLICY "Users can update own activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND NOT is_deleted
  )
  WITH CHECK (
    auth.uid() = user_id
    AND NOT is_deleted
  );

CREATE POLICY "Users can soft delete own activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
    AND is_deleted = true
    AND (SELECT NOT is_deleted FROM activities WHERE id = activities.id)
  );