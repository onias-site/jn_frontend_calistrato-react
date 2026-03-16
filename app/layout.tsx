'use client';
import ProviderComponent from '@/presentation/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import { Nunito } from 'next/font/google';
import React, { useRef, useEffect } from 'react';
import { QueryProvider } from '@/presentation/contexts/QueryProvider';
import './loading.css';
import PubSub from 'pubsub-js';
import { Toast } from 'primereact/toast';
import { ModalLogin, ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';

const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {

    const toast = useRef(null);

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
                toast.current.show({ severity: 'error', summary, detail, life: 10000 });
            });
        }
    };
    const showMessage = (message: any) => message && message.summary && toast.current.show({ severity: message.severity || 'success', life: message.life || 10000, ...message });

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
            <html lang="en">
                <body className={nunito.variable}>
                    <Toast ref={toast} />
                    <div id="cover" style={{ display: 'none' }}></div>
                    <ProviderComponent>{children}</ProviderComponent>
                    <ModalLogin />
                </body>
            </html>
        </QueryProvider>
    );
}
