/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: '.next',
  images: {
    domains: ['m.media-amazon.com', 'ia.media-imdb.com', 'placehold.co'],
  },
}

module.exports = nextConfig