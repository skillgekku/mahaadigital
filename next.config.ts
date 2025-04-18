// next.config.js or next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/skillgekku/media-assets/**',
      },
    ],
  },
};

module.exports = nextConfig;
