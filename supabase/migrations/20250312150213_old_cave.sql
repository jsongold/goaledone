/*
  # Create RRule Settings Table

  1. New Tables
    - `rrule_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `frequency` (text) - DAILY, WEEKLY, MONTHLY, YEARLY
      - `interval` (integer) - How often the rule repeats
      - `weekdays` (text[]) - Array of weekday codes (MO,TU,WE,TH,FR,SA,SU)
      - `until` (timestamptz) - End date for recurrence
      - `count` (integer) - Number of occurrences
      - `bymonthday` (integer[]) - Days of the month
      - `bymonth` (integer[]) - Months of the year
      - `byyearday` (integer[]) - Days of the year
      - `byweekno` (integer[]) - Weeks of the year
      - `bysetpos` (integer[]) - Positions within set

  2. Changes
    - Add rrule_setting_id to goals table
    - Remove repeat_config from goals table
    - Add foreign key constraint

  3. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create RRule Settings table
CREATE TABLE IF NOT EXISTS rrule_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  frequency text NOT NULL CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
  interval integer DEFAULT 1 CHECK (interval > 0),
  weekdays text[] DEFAULT NULL,
  until timestamptz DEFAULT NULL,
  count integer DEFAULT NULL CHECK (count > 0),
  bymonthday integer[] DEFAULT NULL,
  bymonth integer[] DEFAULT NULL,
  byyearday integer[] DEFAULT NULL,
  byweekno integer[] DEFAULT NULL,
  bysetpos integer[] DEFAULT NULL,
  
  -- Ensure weekdays are valid
  CONSTRAINT valid_weekdays CHECK (
    weekdays IS NULL OR 
    array_length(weekdays, 1) > 0 AND
    array_length(weekdays, 1) <= 7 AND
    weekdays <@ ARRAY['MO','TU','WE','TH','FR','SA','SU']
  ),
  
  -- Ensure month days are valid
  CONSTRAINT valid_monthdays CHECK (
    bymonthday IS NULL OR
    array_length(bymonthday, 1) > 0 AND
    (SELECT bool_and(d >= -31 AND d <= 31 AND d != 0) FROM unnest(bymonthday) AS d)
  ),
  
  -- Ensure months are valid
  CONSTRAINT valid_months CHECK (
    bymonth IS NULL OR
    array_length(bymonth, 1) > 0 AND
    (SELECT bool_and(m >= 1 AND m <= 12) FROM unnest(bymonth) AS m)
  ),
  
  -- Ensure year days are valid
  CONSTRAINT valid_yeardays CHECK (
    byyearday IS NULL OR
    array_length(byyearday, 1) > 0 AND
    (SELECT bool_and(d >= -366 AND d <= 366 AND d != 0) FROM unnest(byyearday) AS d)
  ),
  
  -- Ensure week numbers are valid
  CONSTRAINT valid_weeknos CHECK (
    byweekno IS NULL OR
    array_length(byweekno, 1) > 0 AND
    (SELECT bool_and(w >= -53 AND w <= 53 AND w != 0) FROM unnest(byweekno) AS w)
  )
);

-- Enable RLS
ALTER TABLE rrule_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own rrule settings"
  ON rrule_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own rrule settings"
  ON rrule_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rrule settings"
  ON rrule_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rrule settings"
  ON rrule_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add rrule_setting_id to goals table
ALTER TABLE goals
ADD COLUMN rrule_setting_id uuid REFERENCES rrule_settings(id) ON DELETE SET NULL;

-- Drop old repeat_config column
ALTER TABLE goals DROP COLUMN IF EXISTS repeat_config;

-- Drop old validation trigger if it exists
DROP TRIGGER IF EXISTS validate_repeat_config_trigger ON goals;
DROP FUNCTION IF EXISTS validate_repeat_config;