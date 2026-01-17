import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAllBlogs, useBlog } from "@/hooks/useBlogs";
import { useSites } from "@/hooks/useSites";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Loader2, Sparkles, Eye, Lightbulb } from "lucide-react";
import { generateSlug } from "@/lib/slugify";
import { toast } from "sonner";
import type { SiteConfig } from "@/components/templates/types";

interface TopicSuggestion {
  title: string;
  description: string;
  keywords: string[];
}

export default function BlogEditor() {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const isNew = blogId === "new";
  
  const { data: existingBlog, isLoading: blogLoading } = useBlog(isNew ? undefined : blogId);
  const { sites, isLoading: sitesLoading } = useSites();
  const { createBlog, updateBlog } = useAllBlogs();

  const [siteId, setSiteId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTopicDialog, setShowTopicDialog] = useState(false);
  const [topics, setTopics] = useState<TopicSuggestion[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [activeTab, setActiveTab] = useState("write");

  // Load existing blog data
  useEffect(() => {
    if (existingBlog) {
      setSiteId(existingBlog.site_id);
      setTitle(existingBlog.title);
      setSlug(existingBlog.slug);
      setContent(existingBlog.content);
      setMetaDescription(existingBlog.meta_description || "");
      setPublished(existingBlog.published);
    }
  }, [existingBlog]);

  // Auto-generate slug from title
  useEffect(() => {
    if (isNew && title) {
      setSlug(generateSlug(title));
    }
  }, [title, isNew]);

  const selectedSite = sites?.find((s) => s.id === siteId);
  const siteConfig = selectedSite?.config as unknown as SiteConfig | undefined;

  const handleSave = async () => {
    if (!siteId || !title || !content) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);

    try {
      if (isNew) {
        await createBlog.mutateAsync({
          site_id: siteId,
          title,
          slug,
          content,
          meta_description: metaDescription || null,
          published,
          published_at: published ? new Date().toISOString() : null,
        });
      } else {
        await updateBlog.mutateAsync({
          id: blogId!,
          title,
          slug,
          content,
          meta_description: metaDescription || null,
          published,
          published_at: published ? new Date().toISOString() : null,
        });
      }
      navigate("/blogs");
    } catch (error) {
      console.error("Failed to save blog:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuggestTopics = async () => {
    if (!siteId) {
      toast.error("Please select a site first");
      return;
    }

    setLoadingTopics(true);
    setShowTopicDialog(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-blog", {
        body: {
          action: "suggest_topics",
          businessName: siteConfig?.businessName,
          location: siteConfig?.address,
          serviceAreas: siteConfig?.serviceAreas,
          services: siteConfig?.services?.map((s) => s.name),
        },
      });

      if (error) throw error;
      
      if (Array.isArray(data)) {
        setTopics(data);
      } else if (data.raw) {
        toast.error("Failed to parse topic suggestions");
      } else {
        setTopics([]);
      }
    } catch (error) {
      console.error("Failed to suggest topics:", error);
      toast.error("Failed to generate topic suggestions");
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleGenerateFromTopic = async (topic: TopicSuggestion) => {
    setShowTopicDialog(false);
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-blog", {
        body: {
          action: "generate_post",
          topic: topic.title,
          title: topic.title,
          keywords: topic.keywords,
          businessName: siteConfig?.businessName,
          location: siteConfig?.address,
          serviceAreas: siteConfig?.serviceAreas,
          services: siteConfig?.services?.map((s) => s.name),
        },
      });

      if (error) throw error;

      if (data.title) setTitle(data.title);
      if (data.content) setContent(data.content);
      if (data.metaDescription) setMetaDescription(data.metaDescription);
      if (data.suggestedSlug) setSlug(data.suggestedSlug);

      toast.success("Blog post generated! Review and edit before publishing.");
    } catch (error) {
      console.error("Failed to generate blog:", error);
      toast.error("Failed to generate blog post");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePost = async () => {
    if (!siteId) {
      toast.error("Please select a site first");
      return;
    }

    if (!title) {
      toast.error("Please enter a title first");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-blog", {
        body: {
          action: "generate_post",
          title,
          businessName: siteConfig?.businessName,
          location: siteConfig?.address,
          serviceAreas: siteConfig?.serviceAreas,
          services: siteConfig?.services?.map((s) => s.name),
        },
      });

      if (error) throw error;

      if (data.content) setContent(data.content);
      if (data.metaDescription) setMetaDescription(data.metaDescription);

      toast.success("Content generated! Review and edit before publishing.");
    } catch (error) {
      console.error("Failed to generate blog:", error);
      toast.error("Failed to generate blog content");
    } finally {
      setIsGenerating(false);
    }
  };

  if (blogLoading || sitesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/blogs")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isNew ? "New Blog Post" : "Edit Blog Post"}
              </h1>
              <p className="text-muted-foreground">
                {isNew ? "Create a new blog post for your site" : "Update your blog post"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="published" className="text-sm">
                {published ? "Published" : "Draft"}
              </Label>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Site Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Site</CardTitle>
              <CardDescription>Select which site this blog post belongs to</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={siteId} onValueChange={setSiteId} disabled={!isNew}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  {sites?.map((site) => {
                    const config = site.config as { businessName?: string };
                    return (
                      <SelectItem key={site.id} value={site.id}>
                        {config.businessName || "Unnamed Site"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* AI Generation */}
          {siteId && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Blog Generator
                </CardTitle>
                <CardDescription>
                  Let AI help you create SEO-optimized blog content
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSuggestTopics}
                  disabled={isGenerating}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Suggest Topics
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGeneratePost}
                  disabled={isGenerating || !title}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter blog post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  placeholder="url-friendly-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This will be the URL path for your blog post
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta">Meta Description</Label>
                <Textarea
                  id="meta"
                  placeholder="A brief description for search engines (150-160 characters)"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  {metaDescription.length}/160 characters
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="content">Content * (Markdown supported)</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your blog post content here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={20}
                      className="font-mono text-sm"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="preview" className="mt-4">
                  <div className="prose prose-slate max-w-none border rounded-md p-6 min-h-[400px]">
                    <h1>{title || "Your Title Here"}</h1>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: content
                          ? simpleMarkdownToHtml(content)
                          : "<p class='text-muted-foreground'>Your content will appear here...</p>",
                      }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Topic Suggestions Dialog */}
        <Dialog open={showTopicDialog} onOpenChange={setShowTopicDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Topic Suggestions</DialogTitle>
              <DialogDescription>
                AI-generated topic ideas based on your business and current season
              </DialogDescription>
            </DialogHeader>

            {loadingTopics ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Generating topics...</span>
              </div>
            ) : topics.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-auto">
                {topics.map((topic, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleGenerateFromTopic(topic)}
                  >
                    <CardContent className="py-4">
                      <h4 className="font-semibold mb-1">{topic.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {topic.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {topic.keywords?.map((kw, i) => (
                          <span
                            key={i}
                            className="text-xs bg-muted px-2 py-0.5 rounded"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No topics generated. Try again.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

// Simple markdown to HTML converter for preview
function simpleMarkdownToHtml(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*)\*/gim, "<em>$1</em>")
    .replace(/^\- (.*$)/gim, "<li>$1</li>")
    .replace(/\n/gim, "<br>");
}
