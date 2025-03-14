/*
  # Add Goal Repeat Configuration

  1. Changes
    - Add repeat_config column to goals table (JSONB)
    - Add function to generate repeating goals
    - Update existing goals table structure

  2. Data
    - repeat_config structure:
      {
        "enabled": boolean,
        "weekdays": string[],
        "relativeDay": {
          "days": number,
          "type": "before_end" | "after_beginning"
        }
      }
*/

-- Add repeat_config column to goals table
ALTER TABLE goals
ADD COLUMN IF NOT EXISTS repeat_config jsonb DEFAULT NULL;

-- Create function to validate repeat config
CREATE OR REPLACE FUNCTION validate_repeat_config()
RETURNS trigger AS $$
BEGIN
  IF NEW.repeat_config IS NOT NULL THEN
    -- Validate basic structure
    IF NOT (NEW.repeat_config ? 'enabled') THEN
      RAISE EXCEPTION 'repeat_config must contain enabled field';
    END IF;
    
    -- Validate weekdays array if present
    IF (NEW.repeat_config ? 'weekdays') THEN
      IF NOT (NEW.repeat_config->'weekdays' @> '[]'::jsonb) THEN
        RAISE EXCEPTION 'weekdays must be an array';
      END IF;
    END IF;
    
    -- Validate relativeDay if present
    IF (NEW.repeat_config ? 'relativeDay') THEN
      IF NOT (
        (NEW.repeat_config->'relativeDay' ? 'days') AND
        (NEW.repeat_config->'relativeDay' ? 'type')
      ) THEN
        RAISE EXCEPTION 'relativeDay must contain days and type fields';
      END IF;
      
      IF NOT ((NEW.repeat_config->'relativeDay'->>'type')::text IN ('before_end', 'after_beginning')) THEN
        RAISE EXCEPTION 'relativeDay.type must be either before_end or after_beginning';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;