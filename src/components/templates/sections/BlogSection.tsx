import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
}

interface BlogSectionProps {
  blogs: BlogPost[];
  siteSlug: string;
  variant: "classic" | "modern" | "trusted";
}

export function BlogSection({ blogs, siteSlug, variant }: BlogSectionProps) {
  if (!blogs || blogs.length === 0) return null;

  const recentBlogs = blogs.slice(0, 3);

  const styles = {
    classic: {
      section: "py-16 md:py-20 bg-white",
      title: "text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-8 text-center",
      card: "bg-slate-50 border-2 border-slate-200 p-6 rounded-sm hover:border-amber-500 transition-colors",
      cardTitle: "text-lg font-semibold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors",
      cardDesc: "text-slate-600 text-sm mb-4 line-clamp-2",
      cardDate: "text-xs text-slate-500",
      link: "text-amber-600 hover:text-amber-700",
    },
    modern: {
      section: "py-20 md:py-28 bg-black",
      title: "text-3xl md:text-4xl font-bold text-white mb-12 text-center",
      card: "bg-zinc-900 border border-zinc-800 p-6 hover:border-cyan-500 transition-colors",
      cardTitle: "text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors",
      cardDesc: "text-zinc-400 text-sm mb-4 line-clamp-2",
      cardDate: "text-xs text-zinc-500",
      link: "text-cyan-400 hover:text-cyan-300",
    },
    trusted: {
      section: "py-16 md:py-20 bg-stone-50",
      title: "text-2xl md:text-3xl font-bold text-stone-800 mb-8 text-center",
      card: "bg-white border border-stone-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-green-500 transition-all",
      cardTitle: "text-lg font-semibold text-stone-800 mb-2 group-hover:text-green-700 transition-colors",
      cardDesc: "text-stone-600 text-sm mb-4 line-clamp-2",
      cardDate: "text-xs text-stone-500",
      link: "text-green-700 hover:text-green-800",
    },
  };

  const style = styles[variant];

  return (
    <section className={style.section}>
      <div className="container mx-auto px-4">
        <h2 className={style.title}>Latest From Our Blog</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {recentBlogs.map((blog) => (
            <Link
              key={blog.id}
              to={`/site/${siteSlug}/blog/${blog.slug}`}
              className={`${style.card} group block`}
            >
              <h3 className={style.cardTitle}>{blog.title}</h3>
              {blog.meta_description && (
                <p className={style.cardDesc}>{blog.meta_description}</p>
              )}
              <div className={`flex items-center ${style.cardDate}`}>
                <Calendar className="h-3 w-3 mr-1" />
                {blog.published_at
                  ? format(new Date(blog.published_at), "MMM d, yyyy")
                  : format(new Date(blog.created_at), "MMM d, yyyy")}
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            to={`/site/${siteSlug}/blog`}
            className={`inline-flex items-center font-semibold ${style.link}`}
          >
            View All Posts
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
