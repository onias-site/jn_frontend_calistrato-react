'use client';

import IconUser from '@/presentation/icons/icon-user';

import JnAjax from '@/app/JnAjax';
import React from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';

export interface RequestEmailProps {}

export const RequestEmailFooter: React.FC<RequestEmailProps> = ({}) => {
    return (
        <div className="border-t border-[#ebe9f1] p-5 dark:border-white/10">
            <p className="cursor-pointer text-center text-sm text-white-dark dark:text-white-dark/70">Informe o seu e-mail, ainda que seja seu primeiro acesso</p>
        </div>
    );
};
export const RequestEmailClick = (setError: any, showModal: any, callbacks: any, email: string) => {
    const openModal = (selectedScreen: string) => showModal(selectedScreen, '');

    setError('');
    callbacks['201'] = () => openModal('RequestAnswers');
    callbacks['404'] = () => openModal('ConfirmEmail');

    JnAjax.doAnAjaxRequest(`login/${email}/token`, callbacks, 'HEAD', {}, {}, 'http://localhost:8080');
};
export const RequestEmail: React.FC<RequestEmailProps> = ({}) => {
    const { email, setEmail} = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));

    return (
        <div className="relative">
            <span className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 dark:text-white-dark">
                <IconUser className="h-5 w-5" />
            </span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="form-input ltr:pl-10 rtl:pr-10" />
        </div>
    );
};
