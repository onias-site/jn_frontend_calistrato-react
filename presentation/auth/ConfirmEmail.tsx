'use client';
import React, { useEffect } from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';
import IconUser from '@/presentation/icons/icon-user';
import JnAjax from '@/app/JnAjax';

export const ConfirmEmailClick = 'confirmEmail';

export const ConfirmEmailFooter: React.FC<any> = ({}) => {
    return null;
};
export interface ConfirmEmailProps {}

export const ConfirmEmail: React.FC<ConfirmEmailProps> = ({}) => {
    const { email, setInvalid, setDetailMessage, setLockedToken, lockedToken } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));
    useEffect(() => {
        setDetailMessage(`Por favor, confirme o e-mail '${email}' para que possamos prosseguir com sua autenticação, ou corrija seu e-mail caso tenha digitado errado`);
        setInvalid(true);
    }, []);
    const confirmEmail = (value: any) => {
        const invalid = value != email;

        const error = invalid ? `O e-mail '${value}' informado nesta tela, não é o mesmo e-mail '${email}' informado na tela anterior` : '';
        setInvalid(invalid);
        setDetailMessage(error);
        !invalid && JnAjax.isCachedStatus(value, 'checkEmail', 403) && setLockedToken(true);

    };

    return (
        <div className="relative">
            <span className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 dark:text-white-dark">
                <IconUser className="h-5 w-5" />
            </span>
            <input readOnly={lockedToken} onChange={(e) => confirmEmail(e.target.value)} type="email" placeholder="Email" className="form-input ltr:pl-10 rtl:pr-10" />
        </div>
    );
};
