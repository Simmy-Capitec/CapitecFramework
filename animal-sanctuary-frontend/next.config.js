/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      // Add your animal photo hosting domains here
      {
        protocol: 'https',
        hostname: 'sanctuary-photos.s3.amazonaws.com',
      },
    ],
  },
  env: {
    SANCTUARY_API_URL: process.env.SANCTUARY_API_URL || 'http://localhost:3001',
    SANCTUARY_NAME: process.env.SANCTUARY_NAME || 'Paws & Hearts Animal Sanctuary',
  },
};

module.exports = nextConfig;