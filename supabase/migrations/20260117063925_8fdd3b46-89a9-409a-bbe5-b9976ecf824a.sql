-- Add columns to support bilingual content
ALTER TABLE sites ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['en', 'es'];
ALTER TABLE sites ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en';