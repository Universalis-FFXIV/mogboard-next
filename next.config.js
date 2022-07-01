/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['xivapi.com', 'universalis-ffxiv.github.io'],
  },
  output: 'standalone',
};

module.exports = nextConfig;
