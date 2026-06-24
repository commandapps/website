/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // The productized offer is now the three AI Engine tiers on /services.
      { source: "/products", destination: "/services", permanent: true },
      // No client case studies yet — /work is retired until real proof exists.
      { source: "/work", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
