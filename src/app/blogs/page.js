import { apiService } from "../../services/api.service";
import BlogsListClient from "../../components/BlogsListClient";

export const metadata = {
  title: "Blogs & Stories | GoldenHive Holidays",
  description: "Read our latest travel blogs, guides, and tips for your spiritual journeys.",
  keywords: ["travel blogs", "char dham guide", "uttarakhand travel"],
};

export default async function BlogsPage() {
  const blogs = await apiService.getBlogs();
  const blogCategories = await apiService.getBlogCategories();

  return (
    <main>
      <BlogsListClient initialBlogs={blogs} initialCategories={blogCategories} />
    </main>
  );
}