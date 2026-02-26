'use client';
import JnAjax from '@/app/JnAjax';
import React from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';
import IconUser from '@/presentation/icons/icon-user';

export const ConfirmEmailClick = (setError: any, showModal: any, callbacks: any, email: string) => {
    const openModal = (selectedScreen: string) => showModal(selectedScreen, '');

    return () => {
        setError('');
        callbacks['201'] = () => openModal('RequestAnswers');
        callbacks['404'] = () => openModal('ConfirmEmail');

        JnAjax.doAnAjaxRequest(`login/${email}/token`, callbacks, 'HEAD', {}, {}, 'http://localhost:8080');
    };
};

export const ConfirmEmailFooter: React.FC<any> = ({}) => {
    const { showModal } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));
    return (
        <div className="border-t border-[#ebe9f1] p-5 dark:border-white/10">
            <p className="text-center text-sm text-white-dark dark:text-white-dark/70">
                <button onClick={() => showModal('RequestEmail', 'Corrigir e-mail')} type="button" className="text-[#515365] hover:underline ltr:ml-1 rtl:mr-1 dark:text-white-dark">
                    Corrigir e-mail
                </button>
            </p>
        </div>
    );
};
export interface ConfirmEmailProps {}

export const ConfirmEmail: React.FC<ConfirmEmailProps> = ({}) => {
    const { setEmail } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));

    return (
        <div className="relative">
            <span className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 dark:text-white-dark">
                <IconUser className="h-5 w-5" />
            </span>
            <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="form-input ltr:pl-10 rtl:pr-10" />
        </div>
    );
};
