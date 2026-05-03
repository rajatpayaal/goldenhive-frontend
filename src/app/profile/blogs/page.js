"use client";

import { useEffect, useState } from "react";
import { getMyBlogsAction, deleteBlogAction } from "@/actions/blog.actions";
import Link from "next/link";
import { Plus, Edit3, Trash2, Calendar, FileText, Image as ImageIcon } from "lucide-react";
import Loader from "@/components/Loader";

export default function MyBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await getMyBlogsAction();
        if (res.ok) {
          setBlogs(res.data?.data || res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog? This action cannot be undone.")) {
      return;
    }
    
    try {
      const res = await deleteBlogAction(id);
      if (res.ok) {
        setBlogs((prev) => prev.filter((blog) => blog._id !== id));
      } else {
        alert(res.data?.message || res.data?.error || "Failed to delete blog.");
      }
    } catch (err) {
      alert("An error occurred while deleting the blog.");
    }
  };

  if (loading) return <Loader message="Loading your blogs..." />;

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-4 py-8 md:px-12 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 md:text-3xl">My Blogs</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Manage your travel stories and articles.</p>
          </div>
          <Link
            href="/profile/blogs/create"
            className="flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:bg-rose-600 active:scale-95"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Write Blog
          </Link>
        </div>

        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[32px] border border-slate-100 bg-white py-20 text-center shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <FileText className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-xl font-black text-slate-900">No blogs yet</h2>
            <p className="mt-2 max-w-sm text-sm font-semibold text-slate-500">
              Share your travel experiences, guides, and stories with the GoldenHive community.
            </p>
            <Link
              href="/profile/blogs/create"
              className="mt-6 rounded-full bg-[linear-gradient(135deg,var(--gh-accent),var(--gh-accent-strong))] px-8 py-3.5 text-sm font-black text-white shadow-md active:scale-95"
            >
              Create Your First Blog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <div key={blog._id} className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md">
                <div className="relative h-48 w-full bg-slate-100">
                  {blog.bannerImage?.url ? (
                    <img src={blog.bannerImage.url} alt={blog.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100">
                      <ImageIcon className="h-10 w-10 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase text-slate-900 backdrop-blur-sm shadow-sm">
                    {blog.isPublished ? "Published" : "Draft"}
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-black uppercase text-indigo-600">
                      {blog.category || "General"}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 text-base font-black text-slate-900">{blog.title}</h3>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <Link
                      href={`/profile/blogs/${blog._id}/edit`}
                      className="flex items-center gap-1.5 text-xs font-black text-indigo-600 hover:text-indigo-700"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit Blog
                    </Link>
                    <button 
                      onClick={() => handleDelete(blog._id)}
                      className="flex items-center gap-1.5 text-xs font-black text-rose-500 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
