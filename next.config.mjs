/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    },
    responseLimit: '12mb'
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'formidable'];
    return config;
  }
};

export default nextConfig;