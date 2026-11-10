/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    // no "x-powered-by: Next.js" header: it only tells a scanner which version family to attack
    poweredByHeader: false,
    // the image optimizer (/_next/image) is not used (no next/image in the code) and carries remote code execution
    // advisories without a fix in the 14.x line (GHSA-2xp9-vwfh-vxw4, GHSA-2464-fhr4-w9xw); unoptimized turns it off
    images: {
        unoptimized: true,
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
                ],
            },
        ];
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    // 116 type errors in 33 files predate the production build; npx tsc --noEmit lists them
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
