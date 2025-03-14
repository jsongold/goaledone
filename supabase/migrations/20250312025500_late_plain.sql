/*
  # Enhanced Goals Schema

  1. Changes to goals table
    - Add target_metrics (jsonb, stores quantifiable targets)
    - Add timeline_start and timeline_end (timestamptz)
    - Add status (text, current state of the goal)
    - Add progress (integer, percentage complete)
    - Add milestones (jsonb array, related subtasks/checkpoints)
    - Add last_updated (timestamptz, auto-updates)

  2. Security
    - Maintain existing RLS policies
    - Add trigger for last_updated timestamp
*/

-- Enhance goals table with new columns
ALTER TABLE goals
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS target_metrics jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS timeline_start timestamptz,
ADD COLUMN IF NOT EXISTS timeline_end timestamptz,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Not Started',
ADD COLUMN IF NOT EXISTS progress integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS milestones jsonb[] DEFAULT ARRAY[]::jsonb[],
ADD COLUMN IF NOT EXISTS last_updated timestamptz DEFAULT now();

-- Migrate existing description to title if needed
UPDATE goals 
SET title = description 
WHERE title IS NULL;

-- Create trigger function for last_updated
CREATE OR REPLACE FUNCTION update_goals_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS goals_last_updated ON goals;
CREATE TRIGGER goals_last_updated
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_goals_last_updated();