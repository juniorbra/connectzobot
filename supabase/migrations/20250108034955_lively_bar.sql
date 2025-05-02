/*
  # Create users mirror table
  
  1. New Tables
    - users_mirror: Mirror of auth.users with basic info
      - id (uuid, primary key)
      - email (text)
      - phone (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
  
  2. Triggers
    - Sync trigger for INSERT
    - Sync trigger for UPDATE
    - Sync trigger for DELETE
*/

-- Create mirror table
CREATE TABLE users_mirror (
  id uuid PRIMARY KEY,
  email text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users_mirror ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public users_mirror are viewable by everyone"
  ON users_mirror FOR SELECT
  USING (true);

-- Create sync functions
CREATE OR REPLACE FUNCTION sync_users_mirror()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO users_mirror (id, email, phone)
    VALUES (NEW.id, NEW.email, NEW.phone);
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE users_mirror
    SET 
      email = NEW.email,
      phone = NEW.phone,
      updated_at = now()
    WHERE id = NEW.id;
  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM users_mirror
    WHERE id = OLD.id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER sync_users_mirror_insert
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_users_mirror();

CREATE TRIGGER sync_users_mirror_update
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_users_mirror();

CREATE TRIGGER sync_users_mirror_delete
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_users_mirror();