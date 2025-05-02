/*
  # Remove users_mirror table and related objects

  1. Changes
    - Drop triggers on auth.users table
    - Drop sync function
    - Drop users_mirror table
*/

-- Drop triggers
DROP TRIGGER IF EXISTS sync_users_mirror_insert ON auth.users;
DROP TRIGGER IF EXISTS sync_users_mirror_update ON auth.users;
DROP TRIGGER IF EXISTS sync_users_mirror_delete ON auth.users;

-- Drop function
DROP FUNCTION IF EXISTS sync_users_mirror();

-- Drop table
DROP TABLE IF EXISTS users_mirror;