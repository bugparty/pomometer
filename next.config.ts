import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
// Skip during `next build`: init talks to wrangler/miniflare and fails with ECONNREFUSED if not running.
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
if (process.env.NODE_ENV === 'development') {
	void initOpenNextCloudflareForDev()
}
