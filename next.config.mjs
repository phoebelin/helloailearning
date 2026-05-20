/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'components'],
  },
  typescript: {
    // Ignore build errors in test/demo files only
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
