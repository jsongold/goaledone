/*
  # Add todos table for task management

  1. New Tables
    - `todos`
      - `id` (text, primary key)
      - `description` (text, task description)
      - `completed` (boolean, task completion status)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp with time zone)
      - `planned_date` (timestamp with time zone)

  2. Security
    - Enable RLS on todos table
    - Add policies for CRUD operations
*/

CREATE TABLE IF NOT EXISTS todos (
  id text PRIMARY KEY,
  description text NOT NULL,
  completed boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  planned_date timestamptz NOT NULL
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own todos"
  ON todos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own todos"
  ON todos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
  ON todos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
  ON todos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);