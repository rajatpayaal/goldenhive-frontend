import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiService } from "../../../services/api.service";
import { Breadcrumbs } from "../../../components/Breadcrumbs";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blogs = await apiService.getBlogs();
  const blogData = blogs.find(blog => blog.slug === slug);

  if (!blogData) {
    return {
      title: "Blog Not Found",
    };
  }

  const blog = await apiService.getBlogById(blogData._id);

  if (!blog) {
    return {
      title: "Blog Not Found",
    };
  }

  return {
    title: blog.seo?.metaTitle || blog.title,
    description: blog.seo?.metaDescription || blog.sections?.[0]?.content?.substring(0, 160),
    keywords: blog.seo?.keywords?.join(", "),
    openGraph: {
      title: blog.seo?.metaTitle || blog.title,
      description: blog.seo?.metaDescription || blog.sections?.[0]?.content?.substring(0, 160),
      images: blog.seo?.ogImage ? [{ url: blog.seo.ogImage }] : [],
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const blogs = await apiService.getBlogs();
  const blogData = blogs.find(blog => blog.slug === slug);

  if (!blogData) {
    notFound();
  }

  const blog = await apiService.getBlogById(blogData._id);

  if (!blog) {
    notFound();
  }

  return (
    <main className="bg-slate-50 pb-20">
      <article className="mx-auto my-auto max-w-7xl px-5 py-12">
        <Breadcrumbs
          items={[
            { href: "/blogs", label: "Blogs" },
            { href: `/blogs/${blog.slug}`, label: blog.title || "Blog" },
          ]}
        />

        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span aria-hidden="true">←</span> Back to Blogs
          </Link>
        </div>

        {/* Banner */}
        {blog.bannerImage?.url && blog.visibility?.banner !== false && (
          <div className="mb-8 overflow-hidden rounded-3xl shadow-lg">
            <Image
              src={blog.bannerImage.url}
              alt={blog.bannerImage.altText || blog.title}
              width={1200}
              height={400}
              loading="eager"
              className="h-64 w-full object-cover sm:h-80 lg:h-96"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-4 text-sm text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
              {blog.category}
            </span>
            <span>•</span>
            <span>{blog.readTime}</span>
            <span>•</span>
            <span>By {blog.author}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {blog.title}
          </h1>
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-lg mx-auto max-w-7xl">
          {blog.sections
            ?.filter((section) => section.isVisible !== false)
            ?.sort((a, b) => (a.order || 0) - (b.order || 0))
            ?.map((section) => (
              <section key={section.sectionId} className="mb-8">
                {section.title && (
                  <h2 className="mb-4 text-2xl font-black tracking-tight text-slate-900">
                    {section.title}
                  </h2>
                )}
                <div
                  className="text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
                {section.media
                  ?.filter((media) => media.isVisible !== false)
                  ?.map((media, idx) => (
                    <figure key={idx} className="my-6">
                      {media.type === "image" && (
                        <Image
                          src={media.url}
                          alt={media.altText || ""}
                          width={800}
                          height={600}
                          className="rounded-lg shadow-sm"
                        />
                      )}
                      {media.caption && (
                        <figcaption className="mt-2 text-center text-sm text-slate-500">
                          {media.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
              </section>
            ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 pt-8 text-center">
          <Link
            href="/blogs"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-4 text-sm font-black text-white hover:bg-emerald-600"
          >
            Explore More Blogs
          </Link>
        </footer>
      </article>
    </main>
  );
}