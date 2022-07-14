const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  images: {
    domains: [
      'xivapi.com',
      'universalis-ffxiv.github.io',
      'img2.finalfantasyxiv.com',
      'cdn.discordapp.com',
    ],
  },
  compress: false,
  output: 'standalone',
  poweredByHeader: false,
};

module.exports = withBundleAnalyzer(nextConfig);
