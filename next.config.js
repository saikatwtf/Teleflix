/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['m.media-amazon.com', 'ia.media-imdb.com', 'placehold.co'],
  }
}

module.exports = nextConfig