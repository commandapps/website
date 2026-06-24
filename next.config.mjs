/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // The productized offer is now the three AI Engine tiers on /services.
      { source: "/products", destination: "/services", permanent: true },
    ];
  },
};

export default nextConfig;
