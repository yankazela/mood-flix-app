/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Dev-only badge. Bottom-left sat on top of the onboarding footer and the phone tab bar.
  devIndicators: {
    position: 'top-left',
  },
}

export default nextConfig
