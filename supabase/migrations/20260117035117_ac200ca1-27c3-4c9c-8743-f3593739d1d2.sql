-- Add notes column to leads table for follow-up notes
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes text;

-- Add read status for "New" badge functionality
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS read boolean NOT NULL DEFAULT false;