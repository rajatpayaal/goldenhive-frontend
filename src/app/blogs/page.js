import Link from "next/link";
import Image from "next/image";
import { apiService } from "../../services/api.service";

export const metadata = {
  title: "GoldenHive Blogs | Travel Guides & Tips",
  description: "Read our latest travel blogs, guides, and tips for your spiritual journeys.",
  keywords: ["travel blogs", "char dham guide", "uttarakhand travel"],
};

export default async function BlogsPage() {
  const blogs = await apiService.getBlogs();

  return (
    <main className="bg-slate-50 pb-20">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Travel Blogs & Guides
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Discover insights, tips, and stories from our spiritual journeys.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No blogs available yet.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <article
                key={blog._id}
                className="group overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition hover:shadow-lg"
              >
                {blog.bannerImage?.url && (
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={blog.bannerImage.url}
                      alt={blog.bannerImage.altText || blog.title}
                      width={400}
                      height={225}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                    <span className="font-medium">{blog.category}</span>
                    <span>•</span>
                    <span>{blog.readTime}</span>
                  </div>
                  <h2 className="mb-3 text-xl font-black tracking-tight text-slate-900">
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="hover:text-emerald-700"
                    >
                      {blog.title}
                    </Link>
                  </h2>
                  <p className="text-slate-600 line-clamp-3">
                    {blog.sections?.[0]?.content?.substring(0, 150)}...
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-500">
                      By {blog.author}
                    </span>
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="text-sm font-black text-emerald-600 hover:text-emerald-700"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}