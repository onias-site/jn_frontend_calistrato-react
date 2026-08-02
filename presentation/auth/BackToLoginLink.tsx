'use client';
import React from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';

export interface BackToLoginLinkProps {
}

export const BackToLoginLink: React.FC<BackToLoginLinkProps> = () => {
    const { showModal } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));
    return (
        <p className="text-center text-sm text-white-dark dark:text-white-dark/70">
            <button onClick={() => showModal('RequestEmail', 'Trocar o e-mail')} type="button" className="text-[#515365] hover:underline ltr:ml-1 rtl:mr-1 dark:text-white-dark">
               Clique aqui para trocar o e-mail
            </button>
        </p>
    );
};
