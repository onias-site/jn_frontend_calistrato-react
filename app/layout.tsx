'use client';
import ProviderComponent from '@/presentation/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import { Nunito } from 'next/font/google';
import React, { useState, useRef, useEffect } from 'react';
import { QueryProvider } from '@/presentation/contexts/QueryProvider';
import './loading.css';
import PubSub from 'pubsub-js';
import { Toast } from 'primereact/toast';

const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [serverResponse, setServerResponse] = useState({});
    const toast = useRef(null);
    const translate = (error: any) => {
        const translations = {};
        return translations[error.errorName] || (typeof error.errorDescription === "string"
        ?
        error.errorDescription
        :
        showErrorMessages(error.errorDescription.errors)
        );
    };

    useEffect(() => {
        !serverResponse.errors && PubSub.subscribe('httpStatus422', (msg: any, sr: any) => {
            !serverResponse.errors && setServerResponse(sr);
        });
    }, []);

    const showErrorMessages = (errors: any) => {
        for (let fieldName in errors) {
            const errorsInTheField = errors[fieldName];
            errorsInTheField.forEach((error: any) => {
                const detail = translate(error);
                const summary = fieldName;
                toast.current.show({ severity: 'error', summary, detail, life: 10000 });
            });
        }

    }

    showErrorMessages(serverResponse.errors);
    delete serverResponse.errors;
    return (
        <QueryProvider>
            <html lang="en">
                <body className={nunito.variable}>
                    <Toast ref={toast} />
                    <div id="cover" style={{ display: 'none' }}></div>
                    <ProviderComponent>{children}</ProviderComponent>
                </body>
            </html>
        </QueryProvider>
    );
}
