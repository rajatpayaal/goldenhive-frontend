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
    <main className="pb-20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-12">
        {/* Page Hero */}
        <div className="mb-10 rounded-2xl border border-[color:var(--gh-border)] bg-white px-6 py-8 shadow-gh-soft sm:px-10 sm:py-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[color:var(--gh-accent)]">
            GoldenHive Holidays
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[color:var(--gh-heading)] sm:text-4xl lg:text-5xl">
            Travel Blogs &amp; Guides
          </h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-[color:var(--gh-text-soft)]">
            Discover insights, tips, and stories from our spiritual journeys.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--gh-border)] bg-white py-16 text-center shadow-gh-soft">
            <p className="text-base font-semibold text-[color:var(--gh-text-soft)]">No blogs available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <article
                key={blog._id}
                className="group overflow-hidden rounded-2xl border border-[color:var(--gh-border)] bg-white shadow-gh-soft transition hover:-translate-y-1 hover:shadow-gh-medium"
              >
                {blog.bannerImage?.url && (
                  <div className="aspect-video overflow-hidden rounded-t-[2rem]">
                    <Image
                      src={blog.bannerImage.url}
                      alt={blog.bannerImage.altText || blog.title}
                      width={400}
                      height={225}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5 sm:p-6">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[color:var(--gh-text-soft)]">
                    <span className="rounded-full bg-[color:var(--gh-accent-soft)] px-2.5 py-1 text-[color:var(--gh-accent)] font-bold">
                      {blog.category}
                    </span>
                    <span>·</span>
                    <span>{blog.readTime}</span>
                  </div>
                  <h2 className="mb-3 text-lg font-black leading-snug tracking-tight text-[color:var(--gh-heading)]">
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="hover:text-[color:var(--gh-accent)] transition-colors"
                    >
                      {blog.title}
                    </Link>
                  </h2>
                  <p className="line-clamp-3 text-sm font-medium text-[color:var(--gh-text-soft)]">
                    {blog.sections?.[0]?.content?.substring(0, 150)}...
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-[color:var(--gh-border)] pt-4">
                    <span className="text-xs font-bold text-[color:var(--gh-text-soft)]">
                      By {blog.author}
                    </span>
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="text-sm font-black text-[color:var(--gh-accent)] hover:opacity-80 transition-opacity"
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