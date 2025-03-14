/*
  # Create goals table and migrate data

  1. New Tables
    - `goals`
      - `id` (text, primary key)
      - `description` (text)
      - `completed` (boolean)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `planned_date` (timestamptz)

  2. Security
    - Enable RLS on `goals` table
    - Add policies for authenticated users to manage their own goals
*/

-- Create new goals table
CREATE TABLE IF NOT EXISTS goals (
  id text PRIMARY KEY,
  description text NOT NULL,
  completed boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  planned_date timestamptz NOT NULL
);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policies
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
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Migrate data from todos to goals
INSERT INTO goals (id, description, completed, user_id, created_at, planned_date)
SELECT id, description, completed, user_id, created_at, planned_date
FROM todos
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE auth.users.id = todos.user_id
);

-- Drop old todos table
DROP TABLE IF EXISTS todos;