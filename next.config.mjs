/** @type {import('next').NextConfig} */
const distDir = process.env.NEXT_DIST_DIR;
const nextConfig = {
  ...(distDir ? { distDir } : {}),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'goldenhive-prod-assets.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
