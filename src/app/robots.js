export default function robots() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://www.goldenhiveholidays.in";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard/",
        "/api/",
        "/login/",
        "/register/",
        "/checkout/",
        "/payment/",
        "/profile/",
        "/booking-success/",
      ],
    },
    sitemap: [
      `${siteUrl}/sitemap.xml`,
      `${siteUrl}/sitemaps/packages.xml`,
      `${siteUrl}/sitemaps/blogs.xml`,
      `${siteUrl}/sitemaps/categories.xml`,
      `${siteUrl}/sitemaps/campaigns.xml`,
    ],
  };
}
