import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { usePublicBlogs } from "@/hooks/useBlogs";
import { usePublicSite } from "@/hooks/usePublicSite";
import { Loader2, ArrowLeft, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { SiteConfig } from "@/components/templates/types";

export default function PublicBlogList() {
  const { slug } = useParams<{ slug: string }>();
  const { data: site, isLoading: siteLoading } = usePublicSite(slug);
  const { data: blogs, isLoading: blogsLoading } = usePublicBlogs(slug);

  if (siteLoading || blogsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Site Not Found</h1>
          <p className="text-gray-600">This site doesn't exist or isn't published.</p>
        </div>
      </div>
    );
  }

  const config = site.config as unknown as SiteConfig;
  const siteTitle = config.businessName || "Blog";

  return (
    <>
      <Helmet>
        <title>Blog | {siteTitle}</title>
        <meta name="description" content={`Read the latest news and tips from ${siteTitle}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Link
              to={`/site/${slug}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {siteTitle}
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog</h1>

            {!blogs || blogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No blog posts yet. Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-8">
                {blogs.map((blog) => (
                  <article
                    key={blog.id}
                    className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                  >
                    <Link to={`/site/${slug}/blog/${blog.slug}`}>
                      <h2 className="text-2xl font-semibold text-gray-900 hover:text-primary mb-3">
                        {blog.title}
                      </h2>
                    </Link>
                    {blog.meta_description && (
                      <p className="text-gray-600 mb-4">{blog.meta_description}</p>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      {blog.published_at
                        ? format(new Date(blog.published_at), "MMMM d, yyyy")
                        : format(new Date(blog.created_at), "MMMM d, yyyy")}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>

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
