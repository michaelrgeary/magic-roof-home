import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Blog {
  id: string;
  site_id: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogInsert {
  site_id: string;
  title: string;
  slug: string;
  content: string;
  meta_description?: string | null;
  published?: boolean;
  published_at?: string | null;
}

export interface BlogUpdate {
  id: string;
  title?: string;
  slug?: string;
  content?: string;
  meta_description?: string | null;
  published?: boolean;
  published_at?: string | null;
}

// Hook for all blogs across user's sites
export function useAllBlogs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const blogsQuery = useQuery({
    queryKey: ["blogs", "all", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First get user's sites
      const { data: sites, error: sitesError } = await supabase
        .from("sites")
        .select("id, config")
        .eq("user_id", user.id);

      if (sitesError) throw sitesError;
      if (!sites || sites.length === 0) return [];

      const siteIds = sites.map((s) => s.id);

      // Then get blogs for those sites
      const { data: blogs, error: blogsError } = await supabase
        .from("blogs")
        .select("*")
        .in("site_id", siteIds)
        .order("created_at", { ascending: false });

      if (blogsError) throw blogsError;

      // Attach site name to each blog
      return (blogs || []).map((blog) => {
        const site = sites.find((s) => s.id === blog.site_id);
        const config = site?.config as { businessName?: string } | null;
        return {
          ...blog,
          siteName: config?.businessName || "Unknown Site",
        };
      });
    },
    enabled: !!user?.id,
  });

  const createBlog = useMutation({
    mutationFn: async (blog: BlogInsert) => {
      const { data, error } = await supabase
        .from("blogs")
        .insert(blog)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog post created");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create blog: ${error.message}`);
    },
  });

  const updateBlog = useMutation({
    mutationFn: async ({ id, ...updates }: BlogUpdate) => {
      const { data, error } = await supabase
        .from("blogs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog post updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update blog: ${error.message}`);
    },
  });

  const deleteBlog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blogs").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog post deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete blog: ${error.message}`);
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { data, error } = await supabase
        .from("blogs")
        .update({
          published,
          published_at: published ? new Date().toISOString() : null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success(data.published ? "Blog post published" : "Blog post unpublished");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update blog: ${error.message}`);
    },
  });

  return {
    blogs: blogsQuery.data || [],
    isLoading: blogsQuery.isLoading,
    error: blogsQuery.error,
    createBlog,
    updateBlog,
    deleteBlog,
    togglePublish,
  };
}

// Hook for a single blog by ID
export function useBlog(blogId?: string) {
  return useQuery({
    queryKey: ["blogs", blogId],
    queryFn: async () => {
      if (!blogId) return null;

      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", blogId)
        .single();

      if (error) throw error;
      return data as Blog;
    },
    enabled: !!blogId,
  });
}

// Hook for public blogs by site slug
export function usePublicBlogs(siteSlug?: string) {
  return useQuery({
    queryKey: ["public-blogs", siteSlug],
    queryFn: async () => {
      if (!siteSlug) return [];

      // First get the site by domain/slug
      const { data: site, error: siteError } = await supabase
        .from("sites")
        .select("id, config")
        .eq("domain", siteSlug)
        .eq("published", true)
        .single();

      if (siteError || !site) return [];

      // Get published blogs for this site
      const { data: blogs, error: blogsError } = await supabase
        .from("blogs")
        .select("*")
        .eq("site_id", site.id)
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (blogsError) throw blogsError;

      return blogs || [];
    },
    enabled: !!siteSlug,
  });
}

// Hook for a single public blog post
export function usePublicBlogPost(siteSlug?: string, postSlug?: string) {
  return useQuery({
    queryKey: ["public-blog-post", siteSlug, postSlug],
    queryFn: async () => {
      if (!siteSlug || !postSlug) return null;

      // First get the site by domain/slug
      const { data: site, error: siteError } = await supabase
        .from("sites")
        .select("id, config, template")
        .eq("domain", siteSlug)
        .eq("published", true)
        .single();

      if (siteError || !site) return null;

      // Get the blog post
      const { data: blog, error: blogError } = await supabase
        .from("blogs")
        .select("*")
        .eq("site_id", site.id)
        .eq("slug", postSlug)
        .eq("published", true)
        .single();

      if (blogError) return null;

      return { blog, site };
    },
    enabled: !!siteSlug && !!postSlug,
  });
}
