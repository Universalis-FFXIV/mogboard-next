const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['xivapi.com', 'universalis-ffxiv.github.io'],
  },
  output: 'standalone',
};

module.exports = withBundleAnalyzer(nextConfig);
