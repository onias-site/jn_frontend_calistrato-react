'use client';

import IconUser from '@/presentation/icons/icon-user';

import React, { useEffect } from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';
import JnAjax from '@/app/JnAjax';
import { WelcomeMessage } from '@/presentation/auth/WelcomeMessage';

export interface RequestEmailProps {}

export const RequestEmailFooter: React.FC<RequestEmailProps> = ({}) => {
    return <WelcomeMessage />;
};
export const RequestEmailClick = 'checkEmail';
export const RequestEmail: React.FC<RequestEmailProps> = ({}) => {
    const { email, setInvalid, setError, setEmail, error } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));

    const validateEmail = (value: string, oldError: string) => {

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalid = !regex.test(value);
        const error = !value? `Favor informar um e-mail ao qual você tenha pleno acesso` :  invalid ? `O e-mail '${value}' está em formato inválido` : oldError;
        setInvalid(invalid);
        setEmail(value);
        setError(error);
    };

    useEffect(() => {

        setError(error);
        if (!email) {
            setError(`Favor informar um e-mail ao qual você tenha pleno acesso`);
            setInvalid(true);
            return;
        }
        validateEmail(email, error);
    }, []);

    return (
        <div className="relative">
            <span className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 dark:text-white-dark">
                <IconUser className="h-5 w-5" />
            </span>
            <input value={email} onChange={(e) => validateEmail(e.target.value, '')} type="email" placeholder="Email" className="form-input ltr:pl-10 rtl:pr-10" />
        </div>
    );
};
