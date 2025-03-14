/*
  # Create activities table

  1. New Tables
    - `activities`
      - `id` (text, primary key)
      - `timestamp` (timestamptz)
      - `description` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `activities` table
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS activities (
  id text PRIMARY KEY,
  timestamp timestamptz NOT NULL,
  description text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own activities
CREATE POLICY "Users can read own activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own activities
CREATE POLICY "Users can insert own activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own activities
CREATE POLICY "Users can update own activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);