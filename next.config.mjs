/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets local preview use an isolated generated cache when another Next
  // process has locked the default `.next` directory on Windows.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Content-Security-Policy', value: "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com" },
      ],
    }];
  },
  async redirects() {
    return [
      { source: '/studio', destination: '/ai', permanent: true },
      { source: '/pricing', destination: '/bao-gia', permanent: true },
      { source: '/quotes', destination: '/bao-gia', permanent: true },
      { source: '/customers', destination: '/', permanent: true },
      { source: '/projects', destination: '/', permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Serve the public visual site directly at the canonical homepage.
        // Keeping it out of an iframe prevents cross-origin/canonical-domain
        // policies from blocking its styles and scripts.
        { source: '/', destination: '/akacons-website-source/index.html' },
      ],
    };
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
