const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    discordClientId: process.env['DISCORD_CLIENT_ID'],
    discordClientSecret: process.env['DISCORD_CLIENT_SECRET'],
    nextAuthSecret: process.env['NEXTAUTH_SECRET'],
    dbHost: process.env['DATABASE_HOST'],
    dbPort: process.env['DATABASE_PORT'],
    lodestoneHost: process.env['LODESTONE_HOST'],
    lodestonePort: process.env['LODESTONE_PORT'],
  },
  images: {
    domains: [
      'xivapi.com',
      'universalis-ffxiv.github.io',
      'img2.finalfantasyxiv.com',
      'cdn.discordapp.com',
    ],
  },
  compress: false,
  poweredByHeader: false,
};

module.exports = withBundleAnalyzer(nextConfig);
