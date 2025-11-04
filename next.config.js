/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8080',
                pathname: '/images/**',
            },
            {
                protocol: 'https',
                hostname: process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || '',
                port: '',
                pathname: '/images/**',
            },
        ],
        unoptimized: true,
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    }
}

module.exports = nextConfig 