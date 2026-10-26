import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  serverExternalPackages: ["drizzle-orm"],
  // The server reads/writes data dynamically (SQLite, uploads), which makes the bundler trace the whole
  // project. Keep private data and non-runtime files out of the standalone output.
  outputFileTracingExcludes: {
    "*": ["./data/**", "./uploads/**", "./public/uploads/**", "./.env*", "./**/*.sqlite*", "./**/*.bak", "./.git/**", "./.github/**", "./deploy/**", "./README.md", "./*.zip", "./.chawki-release/**"],
  },
  async headers(){return [{source:'/:path*',headers:[
    {key:'X-Content-Type-Options',value:'nosniff'},
    {key:'X-Frame-Options',value:'DENY'},
    {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
    {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'}
  ]}]},
};
export default nextConfig;
