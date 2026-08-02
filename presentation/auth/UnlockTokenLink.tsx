'use client';
import React from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';

export const UnlockTokenLink: React.FC = () => {
    const { doAnAjaxRequest } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));

    return (
        <div className="border-t border-[#ebe9f1] p-5 dark:border-white/10">
            <p className="text-center text-sm text-red-600 dark:text-white-dark/70">
                Seu token está bloqueado!
                <button onClick={() => doAnAjaxRequest('requestUnlockToken')} type="button" className="text-[#515365] hover:underline ltr:ml-1 rtl:mr-1 dark:text-white-dark">
                    Clique aqui para solicitar desbloqueio
                </button>
            </p>
        </div>
    );
};
