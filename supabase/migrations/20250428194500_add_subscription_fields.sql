/*
  # Add subscription fields to profiles table

  1. Changes
    - Add `assinatura` column to track subscription status
    - Add `consumo` column to track message usage
    - Add `franquia` column to track message quota
*/

-- Add subscription status column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS assinatura BOOLEAN DEFAULT false;

-- Add message usage column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consumo INTEGER DEFAULT 0;

-- Add message quota column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS franquia INTEGER DEFAULT 1000;
