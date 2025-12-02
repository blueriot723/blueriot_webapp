-- Change phone column to support arrays
ALTER TABLE blueriot_tastes
ALTER COLUMN phone TYPE TEXT[] USING
  CASE
    WHEN phone IS NULL THEN NULL
    WHEN phone::text = '' THEN NULL
    ELSE ARRAY[phone::text]
  END;

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'blueriot_tastes' AND column_name = 'phone';
