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
  webpack: (config) => {
    // @xenova/transformers auto-selects the native `onnxruntime-node` backend when it
    // runs under Node (SSR / static export), and requiring that native binding crashes
    // the build and direct-load (SSR 500). We only ever run inference in the browser via
    // the WASM backend (onnxruntime-web), so stub out the node backend entirely.
    config.resolve.alias = {
      ...config.resolve.alias,
      'onnxruntime-node': false,
    };
    return config;
  },
};

export default nextConfig;
