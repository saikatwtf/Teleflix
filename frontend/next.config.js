/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ['m.media-amazon.com', 'ia.media-imdb.com', 'placehold.co'],
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
  // Production optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
}

module.exports = nextConfig