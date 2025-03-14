/*
  # Activity Labels Schema

  1. New Tables
    - `labels`
      - `id` (uuid, primary key)
      - `name` (text, unique per user)
      - `color` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
    
    - `activity_labels`
      - `activity_id` (text, references activities)
      - `label_id` (uuid, references labels)
      - Composite primary key (activity_id, label_id)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own labels
    - Add policies for authenticated users to manage activity-label relationships

  3. Changes
    - Add foreign key constraints with cascading deletes
*/

DO $$ BEGIN
  -- Create labels table if it doesn't exist
  CREATE TABLE IF NOT EXISTS labels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    color text NOT NULL,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(name, user_id)
  );

  -- Create activity_labels junction table if it doesn't exist
  CREATE TABLE IF NOT EXISTS activity_labels (
    activity_id text REFERENCES activities(id) ON DELETE CASCADE,
    label_id uuid REFERENCES labels(id) ON DELETE CASCADE,
    PRIMARY KEY(activity_id, label_id)
  );

  -- Enable RLS if not already enabled
  ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
  ALTER TABLE activity_labels ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can create their own labels" ON labels;
  DROP POLICY IF EXISTS "Users can view their own labels" ON labels;
  DROP POLICY IF EXISTS "Users can update their own labels" ON labels;
  DROP POLICY IF EXISTS "Users can delete their own labels" ON labels;
  DROP POLICY IF EXISTS "Users can manage activity labels for their activities" ON activity_labels;

  -- Create new policies
  CREATE POLICY "Users can create their own labels"
    ON labels
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can view their own labels"
    ON labels
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can update their own labels"
    ON labels
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own labels"
    ON labels
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can manage activity labels for their activities"
    ON activity_labels
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM activities
        WHERE activities.id = activity_id
        AND activities.user_id = auth.uid()
      )
    );
END $$;