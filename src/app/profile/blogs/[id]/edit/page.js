"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { updateBlogAction, getBlogByIdAction, getActiveBlogCategoriesAction } from "@/actions/blog.actions";
import { ArrowLeft, Save, Image as ImageIcon, CheckCircle2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/Loader";

export default function EditBlogPage({ params }) {
  const unwrappedParams = use(params);
  const blogId = unwrappedParams.id;
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [readTime, setReadTime] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState(null);
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState([]);
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await getActiveBlogCategoriesAction();
        if (res.ok) {
          setCategories(res.data?.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch categories");
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await getBlogByIdAction(blogId);
        if (res.ok && res.data?.data) {
          const blog = res.data.data;
          setTitle(blog.title || "");
          setSlug(blog.slug || "");
          setCategory(blog.category || "");
          setReadTime(blog.readTime || "");
          setYoutubeUrl(blog.youtubeUrl || "");
          setTags(blog.tags || "");
          setIsPublished(blog.isPublished !== false);
          
          if (blog.bannerImage?.url) {
            setExistingBannerUrl(blog.bannerImage.url);
          }
          
          if (blog.sections && blog.sections.length > 0) {
            setContent(blog.sections[0]?.content || "");
          }
        } else {
          setError("Failed to load blog details.");
        }
      } catch (err) {
        setError("An error occurred while fetching blog data.");
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [blogId]);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setBannerImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("category", category);
      formData.append("author", `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "GoldenHive User");
      formData.append("readTime", readTime);
      formData.append("youtubeUrl", youtubeUrl);
      formData.append("tags", tags);
      formData.append("isPublished", isPublished ? "true" : "false");
      
      if (bannerImageFile) {
        formData.append("bannerImageFile", bannerImageFile);
      }
      
      if (content) {
        const sectionsArray = [{ type: "html", content: content }];
        formData.append("sections", JSON.stringify(sectionsArray));
      }

      const res = await updateBlogAction(blogId, formData);
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/profile/blogs");
        }, 1500);
      } else {
        setError(res.data?.message || res.data?.error || "Failed to update blog");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Loading blog details..." />;

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-4 py-8 md:px-12 md:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/profile/blogs"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 md:text-3xl">Edit Blog</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">Update your travel story details.</p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
            Blog updated successfully! Redirecting...
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-lg font-black text-slate-900">Basic Information</h2>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="col-span-1 md:col-span-2">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Blog Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                  placeholder="e.g. My Trip to Kedarnath"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Slug / URL</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="relative" ref={categoryRef}>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                >
                  <span className={category ? "text-slate-900" : "text-slate-500"}>
                    {category
                      ? categories.find((c) => c._id === category)?.name || "Select a category"
                      : "Select a category"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {isCategoryOpen && (
                  <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_24px_rgba(17,24,39,0.08)]">
                    <div className="max-h-60 overflow-y-auto py-2">
                      {categories.map((cat) => (
                        <button
                          key={cat._id}
                          type="button"
                          onClick={() => {
                            setCategory(cat._id);
                            setIsCategoryOpen(false);
                          }}
                          className={`flex w-full items-center px-4 py-3 text-left text-sm font-bold transition hover:bg-slate-50 ${
                            category === cat._id ? "bg-rose-50 text-rose-600" : "text-slate-700"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                      {categories.length === 0 && (
                        <div className="px-4 py-3 text-sm text-slate-500">No categories found.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Read Time</label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-lg font-black text-slate-900">Media & Content</h2>
            
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Banner Image</label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden transition hover:bg-slate-100 min-h-[160px]">
                  {existingBannerUrl && !bannerImageFile ? (
                    <img src={existingBannerUrl} alt="Banner" className="h-40 w-full object-cover opacity-80" />
                  ) : (
                    <div className="flex flex-col items-center py-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      </div>
                      <span className="mt-4 text-sm font-bold text-slate-600">
                        {bannerImageFile ? bannerImageFile.name : "Click to upload new banner image"}
                      </span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">YouTube Video URL (Optional)</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Blog Content (HTML/Text)</label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm md:p-8">
            <div>
              <h2 className="text-lg font-black text-slate-900">Publish Settings</h2>
              <p className="text-xs font-semibold text-slate-500">Make this blog visible to others instantly.</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <div className="peer h-8 w-14 rounded-full bg-slate-200 after:absolute after:left-[4px] after:top-[4px] after:h-6 after:w-6 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] px-8 py-4 text-sm font-black text-white shadow-lg transition hover:shadow-xl active:scale-95 disabled:opacity-70"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Update Blog
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
