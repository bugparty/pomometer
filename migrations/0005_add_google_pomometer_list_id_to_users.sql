-- Add googlePomometerListId column to users table to cache the AA Pomometer list ID
ALTER TABLE users ADD COLUMN google_pomometer_list_id TEXT;
