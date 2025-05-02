/*
  # Add prompt column to profiles table

  1. Changes
    - Add `prompt` column to `profiles` table
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS prompt text;
