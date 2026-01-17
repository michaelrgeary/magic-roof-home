-- Add Google Business Profile fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS google_refresh_token text,
ADD COLUMN IF NOT EXISTS google_account_id text,
ADD COLUMN IF NOT EXISTS google_location_id text,
ADD COLUMN IF NOT EXISTS google_location_name text,
ADD COLUMN IF NOT EXISTS google_connected_at timestamp with time zone;

-- Add reviews cache and metadata to sites table config is already JSONB
-- We'll store: google_reviews, google_aggregate_rating, reviews_last_updated in the config

-- Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_profiles_google_account ON public.profiles(google_account_id) WHERE google_account_id IS NOT NULL;