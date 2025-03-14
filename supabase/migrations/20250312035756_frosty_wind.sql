/*
  # Fix Goals RLS Policies

  1. Changes
    - Simplify RLS policies for goals table
    - Remove complex conditions that are causing permission issues
    - Ensure basic CRUD operations work properly

  2. Security
    - Maintain user data isolation
    - Allow proper CRUD operations on goals
*/

-- Drop existing goals policies
DROP POLICY IF EXISTS "Users can create their own goals" ON goals;
DROP POLICY IF EXISTS "Users can read their own goals" ON goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON goals;
DROP POLICY IF EXISTS "Users can soft delete their own goals" ON goals;

-- Create simplified policies
CREATE POLICY "Users can create their own goals"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add default value for is_deleted if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'goals' 
    AND column_name = 'is_deleted' 
    AND column_default = 'false'
  ) THEN
    ALTER TABLE goals 
    ALTER COLUMN is_deleted SET DEFAULT false;
  END IF;
END $$;