import ProviderComponent from '@/presentation/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import React from 'react';
import { QueryProvider } from '@/presentation/contexts/QueryProvider';

export const metadata: Metadata = {
    title: {
        template: '%s | JOBSNOW - Seu buscador de currículo',
        default: 'JOBSNOW - Seu buscador de currículo',
    },
};

const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {


    return (
        <QueryProvider>
            <html lang="en">
                <body className={nunito.variable}>
                    <ProviderComponent>{children}</ProviderComponent>
                </body>
            </html>
        </QueryProvider>
    );
}
