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
    // since 2026-11-25 the home page is the resume search (from 2026-11-24 it was the recruiter's positions): a 307 before any rendering (app/(defaults)/page.tsx
    // redirects too, for a navigation inside the app). Since 2026-11-25 the menu "Meu Recrutamento" is "Currículos" and
    // its screens moved from /meu-recrutamento to /curriculos; the old paths stay as permanent redirects (the query
    // string goes along) because the e-mails already sent to the recruiters link them
    async redirects() {
        return [
            {
                source: '/',
                destination: '/curriculos/buscar',
                permanent: false,
            },
            { source: '/meu-recrutamento/vagas', destination: '/curriculos/vagas-cadastradas', permanent: true },
            { source: '/meu-recrutamento/curriculos-visualizados', destination: '/curriculos/vistos', permanent: true },
            { source: '/meu-recrutamento/curriculos-da-semana', destination: '/curriculos/desta-semana', permanent: true },
            { source: '/meu-recrutamento/curriculos-da-vaga', destination: '/curriculos/da-vaga', permanent: true },
            { source: '/meu-recrutamento/minhas-vagas/:path*', destination: '/curriculos/minhas-vagas/:path*', permanent: true },
        ];
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
