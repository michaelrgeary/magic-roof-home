import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { usePublicBlogPost } from "@/hooks/useBlogs";
import { Loader2, ArrowLeft, Calendar, Home } from "lucide-react";
import { format } from "date-fns";
import type { SiteConfig } from "@/components/templates/types";

export default function PublicBlogPost() {
  const { slug, postSlug } = useParams<{ slug: string; postSlug: string }>();
  const { data, isLoading } = usePublicBlogPost(slug, postSlug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data || !data.blog || !data.site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
          <p className="text-gray-600 mb-4">This blog post doesn't exist or isn't published.</p>
          <Link to={`/site/${slug}/blog`} className="text-primary hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const { blog, site } = data;
  const config = site.config as unknown as SiteConfig;
  const siteTitle = config.businessName || "Blog";

  return (
    <>
      <Helmet>
        <title>{blog.title} | {siteTitle}</title>
        {blog.meta_description && (
          <meta name="description" content={blog.meta_description} />
        )}
        <meta property="og:title" content={blog.title} />
        {blog.meta_description && (
          <meta property="og:description" content={blog.meta_description} />
        )}
        <meta property="og:type" content="article" />
        {blog.published_at && (
          <meta property="article:published_time" content={blog.published_at} />
        )}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: blog.title,
            description: blog.meta_description,
            datePublished: blog.published_at || blog.created_at,
            dateModified: blog.updated_at,
            author: {
              "@type": "Organization",
              name: siteTitle,
            },
            publisher: {
              "@type": "Organization",
              name: siteTitle,
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              to={`/site/${slug}/blog`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              All Posts
            </Link>
            <Link
              to={`/site/${slug}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <Home className="h-4 w-4 mr-2" />
              {siteTitle}
            </Link>
          </div>
        </header>

        {/* Article */}
        <article className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
              <div className="flex items-center text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                {blog.published_at
                  ? format(new Date(blog.published_at), "MMMM d, yyyy")
                  : format(new Date(blog.created_at), "MMMM d, yyyy")}
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(blog.content) }} />
            </div>

            {/* CTA */}
            <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="text-xl font-semibold mb-2">Need Roofing Help?</h3>
              <p className="text-gray-600 mb-4">
                Contact {siteTitle} today for a free estimate on your roofing project.
              </p>
              <Link
                to={`/site/${slug}#contact`}
                className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90"
              >
                Get a Free Quote
              </Link>
            </div>
          </div>
        </article>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} {siteTitle}. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

// Enhanced markdown to HTML converter
function markdownToHtml(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-8 mb-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-10 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-12 mb-6">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    // Lists
    .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary hover:underline">$1</a>')
    // Paragraphs (double newlines)
    .replace(/\n\n/gim, '</p><p class="mb-4">')
    // Single newlines
    .replace(/\n/gim, "<br>")
    // Wrap in paragraph
    .replace(/^(.+)$/gim, '<p class="mb-4">$1</p>')
    // Clean up empty paragraphs
    .replace(/<p class="mb-4"><\/p>/gim, "")
    .replace(/<p class="mb-4"><h/gim, "<h")
    .replace(/<\/h([1-6])><\/p>/gim, "</h$1>");
}
