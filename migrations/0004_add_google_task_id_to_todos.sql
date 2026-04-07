-- Add googleTaskId column to todos table for new Google Tasks integration
ALTER TABLE todos ADD COLUMN google_task_id TEXT;
