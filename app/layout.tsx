'use client';
import ProviderComponent from '@/presentation/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
// o tailwind vem primeiro: é nele que a ordem das camadas de CSS é declarada (preflight do tailwind abaixo do Mantine)
import '../styles/tailwind.css';
import '@mantine/core/styles.layer.css';
import '@mantine/notifications/styles.layer.css';
import './loading.css';
import { Nunito } from 'next/font/google';

import React, { useEffect } from 'react';
import { QueryProvider } from '@/presentation/contexts/QueryProvider';
import PubSub from 'pubsub-js';
import { ColorSchemeScript } from '@mantine/core';
import { notify } from '@/presentation/components/source/notify';
import { ModalLogin, ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';

const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const translate = (error: any) => {
        const translations = {};
        return translations[error.errorName] || (typeof error.errorDescription === 'string' ? error.errorDescription : showErrorMessages(error.errorDescription.errors));
    };

    const showErrorMessages = (sr: any) => {
        for (let fieldName in sr.errors) {
            const errorsInTheField = sr.errors[fieldName];
            errorsInTheField.forEach((error: any) => {
                const detail = translate(error);
                const summary = fieldName;
                notify({ severity: 'error', summary, detail, life: 10000 });
            });
        }
    };
    const showMessage = (message: any) => message && message.summary && notify(message);

    const { showModal } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));

    useEffect(() => {
        PubSub.subscribe('httpStatus422', (msg: any, sr: any) => showErrorMessages(sr));
        PubSub.subscribe('showMessage', (msg: any, sr: any) => sr.summary && showMessage(sr));
        PubSub.subscribe('httpStatus401', (msg: any, retryAfter401: any) => showModal('RequestEmail', 'Diga quem é você, antes de continuar...', retryAfter401));
    }, []);

    return (
        <QueryProvider>
            <html lang="pt-BR">
                <head>
                    <ColorSchemeScript />
                </head>
                <body className={nunito.variable}>
                    <div id="cover" style={{ display: 'none' }}></div>
                    <ProviderComponent>
                        {children}
                        <ModalLogin />
                    </ProviderComponent>
                </body>
            </html>
        </QueryProvider>
    );
}
