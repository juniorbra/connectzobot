/*
  # Add helper functions

  1. Changes
    - Add `execute_sql` function for migrations
    - Add `get_profile` RPC function
*/

-- Create helper function to execute SQL (for migrations)
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql TO authenticated;

-- Create RPC function to get user profile
CREATE OR REPLACE FUNCTION get_profile()
RETURNS SETOF profiles AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM profiles
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION get_profile TO authenticated;
