import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiService } from "../../../services/api.service";
import { Breadcrumbs } from "../../../components/Breadcrumbs";

export const revalidate = 0;

function getYouTubeEmbedId(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id || null;
    }
    if (parsed.hostname === "www.youtube.com" || parsed.hostname === "youtube.com") {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch) return embedMatch[1];
      const shortsMatch = parsed.pathname.match(/\/shorts\/([^/?]+)/);
      if (shortsMatch) return shortsMatch[1];
    }
  } catch {
    // invalid URL
  }
  return null;
}

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

  const videoId = getYouTubeEmbedId(blog.seo?.youtubeUrl);

  return (
    <main className="pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-5 sm:mt-10">
        
        {/* Top Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Breadcrumbs
            items={[
              { href: "/blogs", label: "Blogs" },
              { href: `/blogs/${blog.slug}`, label: blog.title || "Blog" },
            ]}
          />
          <Link
            href="/blogs"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] px-4 py-2 text-sm font-bold text-[color:var(--gh-heading)] hover:bg-[color:var(--gh-bg-soft)] transition-colors"
          >
            <span aria-hidden="true">←</span> Back to Blogs
          </Link>
        </div>

        {/* Hero / Banner Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl min-h-[40vh] sm:min-h-[50vh] flex flex-col justify-end">
          {(blog.bannerImage?.url && blog.visibility?.banner !== false) ? (
            <Image
              src={blog.bannerImage.url}
              alt={blog.bannerImage.altText || blog.title}
              fill
              className="object-cover opacity-60"
              priority
            />
          ) : (
             <div className="absolute inset-0 bg-gh-accent/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          
          <div className="relative p-6 sm:p-10 lg:p-14 w-full">
            <div className="max-w-4xl">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-bold text-white/90">
                <span className="rounded-full bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] px-3 py-1 text-white tracking-widest uppercase">
                  {blog.category}
                </span>
                {blog.readTime && (
                  <>
                    <span className="opacity-50">•</span>
                    <span>{blog.readTime} read</span>
                  </>
                )}
                {blog.author && (
                  <>
                    <span className="opacity-50">•</span>
                    <span>By {blog.author}</span>
                  </>
                )}
              </div>
              
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                {blog.title}
              </h1>

              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Main Content Area */}
          <div className="space-y-8 min-w-0 w-full">
            <div className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] px-5 py-8 shadow-[0_18px_45px_rgba(121,68,44,0.10)] sm:px-10 sm:py-12">
              <div className="prose prose-lg max-w-none prose-headings:text-[color:var(--gh-heading)] prose-p:text-[color:var(--gh-text)] prose-a:text-[color:var(--gh-accent)]">
                {blog.content && (!blog.sections || blog.sections.length === 0) && (
                  <div
                    className="text-[color:var(--gh-text)] leading-loose text-[17px] whitespace-pre-wrap mb-10"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />
                )}
                {blog.sections
                  ?.filter((section) => section.isVisible !== false)
                  ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                  ?.map((section) => (
                    <section key={section.sectionId} className="mb-10 last:mb-0">
                      {section.title && (
                        <h2 className="mb-6 text-2xl font-black tracking-tight text-[color:var(--gh-heading)] sm:text-3xl">
                          {section.title}
                        </h2>
                      )}
                      <div
                        className="text-[color:var(--gh-text)] leading-loose text-[17px] whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                      {section.media
                        ?.filter((media) => media.isVisible !== false)
                        ?.map((media, idx) => (
                          <figure key={idx} className="my-8">
                            {media.type === "image" && (
                              <div className="relative overflow-hidden rounded-[1.5rem] shadow-[0_8px_30px_rgba(121,68,44,0.12)]">
                                <Image
                                  src={media.url}
                                  alt={media.altText || ""}
                                  width={1000}
                                  height={600}
                                  className="w-full object-cover"
                                />
                              </div>
                            )}
                            {media.caption && (
                              <figcaption className="mt-3 text-center text-sm font-semibold text-[color:var(--gh-text-soft)]">
                                {media.caption}
                              </figcaption>
                            )}
                          </figure>
                        ))}
                    </section>
                  ))}
              </div>
            </div>

            {/* Mobile Back Button */}
            <div className="sm:hidden text-center mt-6">
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gh-border)] bg-white px-5 py-3 text-sm font-bold text-[color:var(--gh-heading)] shadow-sm"
              >
                <span aria-hidden="true">←</span> Back to Blogs
              </Link>
            </div>
          </div>

          {/* Sidebar / Additional Info */}
          <aside className="space-y-6">
            {/* YouTube Video Section */}
            {videoId && (
              <div className="rounded-[2rem] border border-[color:var(--gh-border)] bg-[rgba(255,253,249,0.96)] p-5 shadow-[0_18px_45px_rgba(121,68,44,0.10)]">
                <h3 className="mb-4 text-lg font-black tracking-tight text-[color:var(--gh-heading)]">
                  Watch Video
                </h3>
                <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-inner" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                    title={blog.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Quick Share or Newsletter can go here in the future */}
            <div className="rounded-[2rem] border border-rose-100 bg-gradient-to-br from-rose-50 to-orange-50 p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <span className="text-xl">✨</span>
              </div>
              <h4 className="mb-2 text-base font-black text-slate-800">Love reading our blogs?</h4>
              <p className="text-sm font-medium text-slate-600">
                Explore our amazing packages designed for a spiritual journey of a lifetime.
              </p>
              <Link href="/packages" className="mt-4 inline-block w-full rounded-full bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] px-4 py-3 text-sm font-black text-white shadow-md transition-transform hover:scale-105 active:scale-95">
                Explore Packages
              </Link>
            </div>
          </aside>
        </div>

      </div>
    </main>
  );
}