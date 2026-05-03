import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiService } from "../../../services/api.service";
import { 
  Clock, 
  Calendar, 
  Eye, 
  Share2, 
  Bookmark, 
  ArrowLeft,
  MoreVertical,
  Heart
} from "lucide-react";

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

  if (!blogData) return { title: "Blog Not Found" };

  const blog = await apiService.getBlogById(blogData._id);
  if (!blog) return { title: "Blog Not Found" };

  return {
    title: blog.seo?.metaTitle || `${blog.title} | GoldenHive Blogs`,
    description: blog.seo?.metaDescription || blog.sections?.[0]?.content?.substring(0, 160),
    keywords: blog.seo?.keywords?.join(", "),
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const blogs = await apiService.getBlogs();
  const blogData = blogs.find(blog => blog.slug === slug);

  if (!blogData) notFound();

  const blog = await apiService.getBlogById(blogData._id);
  if (!blog) notFound();

  const videoId = getYouTubeEmbedId(blog.seo?.youtubeUrl);

  return (
    <main className="min-h-screen bg-white pb-24 md:pb-32">
        
      {/* ── TOP APP BAR (Mobile Reference) ── */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
            <Link href="/blogs" className="text-slate-900 transition hover:opacity-70">
                <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="text-[15px] font-black text-slate-900">Blog Details</span>
        </div>
        <div className="flex items-center gap-4 text-slate-900">
            <button className="transition hover:opacity-70">
                <Bookmark className="h-5 w-5" />
            </button>
            <button className="transition hover:opacity-70">
                <MoreVertical className="h-5 w-5" />
            </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        
        {/* ── FULL WIDTH IMAGE ── */}
        <div className="relative aspect-[16/10] w-full bg-slate-100 md:aspect-video md:rounded-3xl md:overflow-hidden md:mt-4">
            {(blog.bannerImage?.url && blog.visibility?.banner !== false) ? (
                <Image
                    src={blog.bannerImage.url}
                    alt={blog.bannerImage.altText || blog.title}
                    fill
                    className="object-cover"
                    priority
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-rose-50 text-rose-200">
                    No Image Provided
                </div>
            )}
        </div>

        {/* ── TITLE & AUTHOR SECTION ── */}
        <div className="px-4 pt-5 pb-6 md:px-8 md:pt-8">
            <div className="flex items-center justify-between">
                <span className="rounded bg-rose-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[color:var(--gh-accent)]">
                    {blog.category}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-500">
                    <Clock className="h-3.5 w-3.5" /> {blog.readTime || "5 min read"}
                </span>
            </div>
            
            <h1 className="mt-4 text-[22px] font-black leading-snug text-slate-900 md:text-4xl md:leading-tight">
                {blog.title}
            </h1>
            
            <div className="mt-5 flex items-center gap-4 pb-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-[10px] font-black text-slate-500">
                        {blog.author?.[0] || "A"}
                    </div>
                    <span className="text-[11px] font-bold text-slate-900">{blog.author}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> 0 Views
                    </span>
                </div>
            </div>
        </div>

        {/* ── CONTENT SECTION ── */}
        <div className="px-4 pb-8 md:px-8">
            <div className="prose prose-sm md:prose-base prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:font-medium prose-p:text-slate-600 prose-img:rounded-xl">
                {blog.content && (!blog.sections || blog.sections.length === 0) && (
                    <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                )}

                {blog.sections
                    ?.filter((section) => section.isVisible !== false)
                    ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                    ?.map((section) => (
                        <section key={section.sectionId} className="mb-8">
                            {section.title && (
                                <h3 className="mb-3 text-[17px] font-black text-slate-900">
                                    {section.title}
                                </h3>
                            )}
                            <div className="text-[13px] leading-[1.6] text-slate-600 mb-4" dangerouslySetInnerHTML={{ __html: section.content }} />
                            
                            {section.media
                                ?.filter((media) => media.isVisible !== false)
                                ?.map((media, idx) => (
                                    <figure key={idx} className="my-5">
                                        {media.type === "image" && (
                                            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                                <Image
                                                    src={media.url}
                                                    alt={media.altText || ""}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        {media.caption && (
                                            <figcaption className="mt-2 text-[11px] font-medium italic text-slate-500">
                                                {media.caption}
                                            </figcaption>
                                        )}
                                    </figure>
                                ))}
                        </section>
                    ))}
            </div>
            
            {/* Video embed */}
            {videoId && (
                <div className="mt-8 overflow-hidden rounded-xl bg-slate-900">
                    <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
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
        </div>
      </div>

      {/* ── FIXED FOOTER (Mobile Reference) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white/95 backdrop-blur-xl px-4 py-3 pb-[env(safe-area-inset-bottom)] md:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <button className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-rose-500 transition-colors">
                    <Heart className="h-5 w-5" strokeWidth={1.5} />
                    0
                </button>
                <button className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-rose-500 transition-colors">
                    <Share2 className="h-5 w-5" strokeWidth={1.5} />
                    0
                </button>
            </div>
            <button className="flex-1 rounded-[14px] bg-[color:var(--gh-accent)] py-3 text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(225,29,72,0.3)] transition active:scale-95">
                Share Blog
            </button>
        </div>
      </div>

    </main>
  );
}