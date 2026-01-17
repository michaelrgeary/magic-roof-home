-- Create blogs table for blog posts
CREATE TABLE public.blogs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  content text NOT NULL,
  meta_description text,
  published boolean NOT NULL DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(site_id, slug)
);

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Create policies for blog access
CREATE POLICY "Site owners can view their blogs"
ON public.blogs FOR SELECT
USING (is_site_owner(site_id));

CREATE POLICY "Site owners can insert blogs"
ON public.blogs FOR INSERT
WITH CHECK (is_site_owner(site_id));

CREATE POLICY "Site owners can update their blogs"
ON public.blogs FOR UPDATE
USING (is_site_owner(site_id));

CREATE POLICY "Site owners can delete their blogs"
ON public.blogs FOR DELETE
USING (is_site_owner(site_id));

-- Public can view published blogs for published sites
CREATE POLICY "Anyone can view published blogs on published sites"
ON public.blogs FOR SELECT
USING (
  published = true 
  AND EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = blogs.site_id 
    AND sites.published = true
  )
);

-- Create index for faster lookups
CREATE INDEX idx_blogs_site_id ON public.blogs(site_id);
CREATE INDEX idx_blogs_slug ON public.blogs(site_id, slug);
CREATE INDEX idx_blogs_published ON public.blogs(published, published_at DESC);

-- Add updated_at trigger
CREATE TRIGGER update_blogs_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();