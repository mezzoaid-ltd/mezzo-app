/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["utfs.io"], // Add this line
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
