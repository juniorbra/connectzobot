/*
  # Add WhatsApp field to profiles table

  1. Changes
    - Add `whatsapp` column to store the connected WhatsApp number
*/

-- Add WhatsApp number column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;
