-- Add RLS policy for public site viewing
CREATE POLICY "Anyone can view published sites by domain" 
ON public.sites 
FOR SELECT 
USING (published = true AND domain IS NOT NULL);