/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['m.media-amazon.com', 'ia.media-imdb.com'],
  },
  env: {
    API_URL: process.env.API_URL || 'https://api.yourdomain.com'
  },
  async rewrites() {
    // Use a hardcoded fallback during build time
    const apiUrl = process.env.API_URL || 'https://api.yourdomain.com';
    return [
      {
        source: '/api/:path*',
        destination: apiUrl + '/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig