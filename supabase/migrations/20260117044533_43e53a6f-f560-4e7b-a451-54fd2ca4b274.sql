-- Enable RLS on blogs table
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Users can view their own blogs (via site ownership)
CREATE POLICY "Users can view blogs for their sites"
  ON public.blogs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = blogs.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- Users can insert blogs for their sites
CREATE POLICY "Users can insert blogs for their sites"
  ON public.blogs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = blogs.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- Users can update their own blogs
CREATE POLICY "Users can update blogs for their sites"
  ON public.blogs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = blogs.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- Users can delete their own blogs
CREATE POLICY "Users can delete blogs for their sites"
  ON public.blogs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = blogs.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- Public can view published blogs on published sites
CREATE POLICY "Public can view published blogs"
  ON public.blogs FOR SELECT
  USING (
    published = true
    AND EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = blogs.site_id
      AND sites.published = true
    )
  );