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
import {ModalLogin, ModalLoginStore, IModalLoginStore} from '@/presentation/auth/ModalLogin';

const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [serverResponse, setServerResponse] = useState({});
    const [infoMessage, setInfoMessage] = useState({});
    const [showLogin, setShowLogin] = useState(false);
    const [message, setMessage] = useState({});
    const toast = useRef(null);
    const translate = (error: any) => {
        const translations = {};
        return translations[error.errorName] || (typeof error.errorDescription === 'string' ? error.errorDescription : showErrorMessages(error.errorDescription.errors));
    };

    useEffect(() => {
        !serverResponse.errors &&
            PubSub.subscribe('httpStatus422', (msg: any, sr: any) => {
                !serverResponse.errors && setServerResponse(sr);
            });
        PubSub.subscribe('showInfoMessage', (msg: any, sr: any) => {
            sr.summary && setInfoMessage(sr);
        });
        PubSub.subscribe('showMessage', (msg: any, sr: any) => {
            sr.summary && setMessage(sr);
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
    };
    const { showModal} = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));

    const showInfoMessage = () => infoMessage && infoMessage.summary && toast.current.show({ severity: 'warn', life: 10000, ...infoMessage });
    const showMessage = () => message && message.summary && toast.current.show({ severity: message.severity || 'success', life: message.life || 10000, ...message });


    PubSub.subscribe('httpStatus401', () => showModal('RequestEmail', 'Diga quem é você, antes de continuar...'));
    showMessage();
    showInfoMessage();
    showErrorMessages(serverResponse.errors);
    delete serverResponse.errors;
    delete infoMessage.summary;
    return (
        <QueryProvider>
            <html lang="en">
                <body className={nunito.variable}>
                    <Toast ref={toast} />
                    <div id="cover" style={{ display: 'none' }}></div>
                    <ProviderComponent>{children}</ProviderComponent>
                    <ModalLogin/>
                </body>
            </html>
        </QueryProvider>
    );
}
