'use client';
import React from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';

export const ResendTokenLink: React.FC = () => {
    const { loading, doAnAjaxRequest, lockedToken } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));

    if (lockedToken || loading) return null;

    return (
        <p className="text-center text-sm text-white-dark dark:text-white-dark/70">
            Não recebeu ou perdeu o token?
            <button onClick={() => doAnAjaxRequest('requestResendToken')} type="button" className="text-[#515365] hover:underline ltr:ml-1 rtl:mr-1 dark:text-white-dark">
                Clique aqui para reenviar
            </button>
        </p>
    );
};
