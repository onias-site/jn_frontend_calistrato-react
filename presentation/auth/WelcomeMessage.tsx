'use client';
import React from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';
import JnAjax from '@/app/JnAjax';

export const WelcomeMessage: React.FC = () => {
    const { email } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));

    return (
        <div className="border-t border-[#ebe9f1] p-5 dark:border-white/10">
            <p className="cursor-pointer text-center text-sm text-white-dark dark:text-white-dark/70">
                {!email ? 'Informe o seu e-mail' : JnAjax.hasPastLogin(email) ? 'Você já esteve aqui conosco, obrigado pelo retorno!!!' : 'Seja bem vindo ao seu primeiro acesso!!!'}
            </p>
        </div>
    );
};
