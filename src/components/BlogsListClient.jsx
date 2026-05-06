"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoginModal } from "@/components/LoginModal";
import { 
  Search, 
  Clock, 
  Eye, 
  ChevronRight, 
  Bookmark, 
  Share2, 
  Star,
  LayoutGrid,
  MapPin,
  Lightbulb,
  MoreHorizontal,
  SlidersHorizontal,
  Calendar,
  PenLine
} from "lucide-react";

export default function BlogsListClient({ initialBlogs = [], initialCategories = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Blogs");
    const { user } = useAuth();
    const router = useRouter();
    const [isLoginOpen, setIsLoginOpen] = useState(false);

  const categories = useMemo(() => {
    const cats = [{ name: "All Blogs", icon: LayoutGrid }];
    
    initialCategories.forEach((cat) => {
      let icon = Lightbulb;
      const lowerName = cat.name.toLowerCase();
      if (lowerName.includes("destination")) icon = MapPin;
      else if (lowerName.includes("spiritual")) icon = Star;
      
      cats.push({ name: cat.name, icon });
    });
    
    if (cats.length === 1) {
      // Fallback if no categories fetched
      cats.push(
        { name: "Destinations", icon: MapPin },
        { name: "Travel Tips", icon: Lightbulb },
        { name: "More", icon: MoreHorizontal }
      );
    }
    
    return cats;
  }, [initialCategories]);

  const filteredBlogs = useMemo(() => {
    return initialBlogs
      .filter((blog) => {
        const matchesSearch = 
            blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.sections?.some(s => s.content?.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = activeCategory === "All Blogs" || 
                                (activeCategory === "More" && !categories.some(c => c.name === blog.category)) ||
                                blog.category === activeCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [initialBlogs, searchQuery, activeCategory]);

  const featuredBlog = filteredBlogs[0];
  const remainingBlogs = filteredBlogs.slice(1);

  return (
    <div className="min-h-screen bg-white pb-24 md:bg-[#FAFAFA]">
      
      {/* ── MOBILE HERO SECTION (Matches Reference) ── */}
      <section className="relative overflow-hidden bg-slate-50 px-4 pt-6 pb-6 md:px-8 md:pt-12 md:pb-12">
        {/* Background Graphic (Approximating the mountain/sun from reference) */}
        <div className="absolute inset-0 z-0 opacity-20 md:opacity-10 pointer-events-none overflow-hidden">
             <div className="absolute top-10 right-10 h-32 w-32 rounded-full bg-rose-500 blur-2xl" />
             <div className="absolute bottom-0 left-0 w-full h-1/2 bg-slate-900 clip-path-mountains opacity-10" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-6xl">
            <div className="flex items-center justify-between">
              <h1 className="text-[28px] font-black tracking-tight text-slate-900 md:text-5xl">
                Blogs & Stories
              </h1>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!user) {
                                        setIsLoginOpen(true);
                                        return;
                                    }
                                    router.push("/profile/blogs/create");
                                }}
                className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(225,29,72,0.35)] transition-all hover:opacity-90 active:scale-95 md:px-5 md:py-3 md:text-sm"
                style={{ background: "linear-gradient(135deg, var(--gh-accent), var(--gh-accent-strong))" }}
              >
                <PenLine className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2.5} />
                Create Blog
                            </button>
            </div>
            <p className="mt-2 text-xs font-medium text-slate-500 max-w-[250px] md:max-w-md md:text-base">
              Travel tips, guides and real experiences from fellow travelers.
            </p>

            {/* Search Bar */}
            <div className="mt-6 flex items-center rounded-full border border-slate-200 bg-white p-1.5 shadow-sm md:max-w-lg">
                <div className="flex flex-1 items-center gap-2 pl-3">
                  <Search className="h-4 w-4 text-slate-400" strokeWidth={2} />
                  <input
                    type="text"
                    placeholder="Search blogs, destinations, tips..."
                    className="w-full bg-transparent py-2 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="rounded-full bg-[color:var(--gh-accent)] px-6 py-2.5 text-xs font-bold text-white transition hover:opacity-90 active:scale-95">
                  Search
                </button>
            </div>
        </div>
      </section>

      {/* ── CATEGORY CHIPS ── */}
      <div className="mx-auto max-w-6xl px-4 md:px-8 pt-6 pb-2">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat) => {
                const isActive = activeCategory === cat.name;
                return (
                    <button
                        key={cat.name}
                        onClick={() => setActiveCategory(cat.name)}
                        className={`flex whitespace-nowrap items-center gap-1.5 rounded-full border px-4 py-2 text-[11px] font-bold transition-all ${
                            isActive
                            ? "border-rose-100 bg-rose-50 text-[color:var(--gh-accent)]"
                            : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        <cat.icon className={`h-3.5 w-3.5 ${isActive ? "text-[color:var(--gh-accent)]" : "text-slate-400"}`} strokeWidth={2} />
                        {cat.name}
                    </button>
                );
            })}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-8 pt-4">
        
        {/* ── FEATURED BLOG ── */}
        {featuredBlog && !searchQuery && activeCategory === "All Blogs" && (
            <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-base font-black text-slate-900 md:text-xl">
                        <Star className="h-4 w-4 text-[color:var(--gh-accent)]" fill="currentColor" />
                        Featured Blogs
                    </h2>
                    <Link href="/blogs" className="flex items-center text-xs font-bold text-[color:var(--gh-accent)]">
                        View All <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                <Link href={`/blogs/${featuredBlog.slug}`} className="block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm md:rounded-3xl">
                    <div className="relative aspect-[16/9] w-full">
                        <Image
                            src={featuredBlog.bannerImage?.url || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"}
                            alt={featuredBlog.title}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute top-3 left-3 rounded bg-[color:var(--gh-accent)] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white">
                            Featured
                        </div>
                    </div>
                    <div className="p-4 md:p-6">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                            <span className="rounded bg-rose-50 px-2 py-1 text-[color:var(--gh-accent)]">{featuredBlog.category}</span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {featuredBlog.readTime || "5 min read"}
                            </span>
                        </div>
                        <h3 className="mt-3 text-base font-black leading-snug text-slate-900 md:text-2xl">
                            {featuredBlog.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-xs font-medium text-slate-500 md:text-sm">
                            {featuredBlog.sections?.[0]?.content?.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                        </p>
                        
                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-500 overflow-hidden">
                                {featuredBlog.author?.[0] || "A"}
                            </div>
                            <span className="text-xs font-bold text-slate-900">{featuredBlog.author}</span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 ml-2">
                                <Calendar className="h-3 w-3" />
                                {featuredBlog.createdAt ? new Date(featuredBlog.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ""}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 ml-2">
                                <Eye className="h-3 w-3" /> 0 Views
                            </span>
                        </div>
                    </div>
                </Link>
            </div>
        )}

        {/* ── ALL BLOGS LIST ── */}
        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 md:text-xl">All Blogs</h2>
            <button className="flex items-center gap-1 text-xs font-bold text-[color:var(--gh-accent)]">
                Sort <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
        </div>

        {filteredBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
                <Search className="h-8 w-8 text-slate-300 mb-3" />
                <h3 className="text-sm font-black text-slate-900">No blogs found</h3>
                <button onClick={() => {setSearchQuery(""); setActiveCategory("All Blogs");}} className="mt-2 text-xs font-bold text-[color:var(--gh-accent)]">
                    Clear filters
                </button>
            </div>
        ) : (
            <div className="flex flex-col gap-4">
                {(featuredBlog && !searchQuery && activeCategory === "All Blogs" ? remainingBlogs : filteredBlogs).map((blog) => (
                    <article key={blog._id} className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm md:p-4 md:gap-6">
                        {/* Left Image */}
                        <Link href={`/blogs/${blog.slug}`} className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl md:h-32 md:w-40">
                            <Image
                                src={blog.bannerImage?.url || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80"}
                                alt={blog.title}
                                fill
                                className="object-cover"
                            />
                        </Link>
                        
                        {/* Right Content */}
                        <div className="flex flex-1 flex-col py-0.5">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-wrap items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[color:var(--gh-accent)]">{blog.category}</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-2.5 w-2.5" /> {blog.readTime || "5 min read"}
                                    </span>
                                </div>
                                <button className="text-slate-400 hover:text-[color:var(--gh-accent)] -mt-1 -mr-1 p-1">
                                    <Bookmark className="h-4 w-4" />
                                </button>
                            </div>
                            
                            <h3 className="mt-1.5 line-clamp-2 text-sm font-black leading-tight text-slate-900 md:text-lg">
                                <Link href={`/blogs/${blog.slug}`}>
                                    {blog.title}
                                </Link>
                            </h3>
                            
                            <div className="mt-auto pt-2 flex items-center gap-2">
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[8px] font-black text-slate-500 overflow-hidden">
                                    {blog.author?.[0] || "A"}
                                </div>
                                <span className="truncate text-[10px] font-bold text-slate-900 md:text-xs">{blog.author}</span>
                                <span className="flex shrink-0 items-center gap-1 text-[9px] font-bold text-slate-400">
                                    <Calendar className="h-2.5 w-2.5" />
                                    {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ""}
                                </span>
                                <span className="hidden md:flex shrink-0 items-center gap-1 text-[9px] font-bold text-slate-400">
                                    <Eye className="h-2.5 w-2.5" /> 0
                                </span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        )}
      </div>
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </div>
  );
}
