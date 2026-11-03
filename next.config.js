/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    // 116 type errors in 33 files predate the production build; npx tsc --noEmit lists them
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
