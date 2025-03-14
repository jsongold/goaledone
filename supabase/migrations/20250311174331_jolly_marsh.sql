/*
  # Add Activity Fields Migration

  1. Changes
    - Add duration column (integer, minutes)
    - Add category column (text)
    - Add notes column (text, optional)

  2. Data Migration
    - Set default values for existing records
*/

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS duration integer NOT NULL DEFAULT 30,
ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Other',
ADD COLUMN IF NOT EXISTS notes text;