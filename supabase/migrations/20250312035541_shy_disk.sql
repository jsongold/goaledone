/*
  # Fix RLS Policies for Goals and Activities

  1. Changes
    - Fix goals RLS policies to allow proper CRUD operations
    - Fix activities soft delete policy to use proper subquery
    - Ensure consistent policy behavior across tables

  2. Security
    - Maintain user data isolation
    - Allow proper soft deletion
    - Fix subquery expressions
*/

-- Drop existing goals policies
DROP POLICY IF EXISTS "Users can create their own goals" ON goals;
DROP POLICY IF EXISTS "Users can read their own goals" ON goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON goals;
DROP POLICY IF EXISTS "Users can soft delete their own goals" ON goals;

-- Create new goals policies
CREATE POLICY "Users can create their own goals"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT is_deleted
  );

CREATE POLICY "Users can read their own goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND NOT is_deleted
  );

CREATE POLICY "Users can update their own goals"
  ON goals
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

CREATE POLICY "Users can soft delete their own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
    AND is_deleted = true
    AND EXISTS (
      SELECT 1 FROM goals g2 
      WHERE g2.id = goals.id 
      AND NOT g2.is_deleted
    )
  );

-- Drop existing activities policies
DROP POLICY IF EXISTS "Users can insert own activities" ON activities;
DROP POLICY IF EXISTS "Users can read own activities" ON activities;
DROP POLICY IF EXISTS "Users can update own activities" ON activities;
DROP POLICY IF EXISTS "Users can soft delete own activities" ON activities;

-- Create new activities policies
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
    AND EXISTS (
      SELECT 1 FROM activities a2 
      WHERE a2.id = activities.id 
      AND NOT a2.is_deleted
    )
  );