/*
  # Add prompt column to profiles table

  1. Changes
    - Add `prompt` column to `profiles` table if it doesn't exist
*/

-- Add prompt column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS prompt text;
