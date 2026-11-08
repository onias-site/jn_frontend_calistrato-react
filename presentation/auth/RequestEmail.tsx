'use client';

import IconUser from '@/presentation/icons/icon-user';
import { TextInput } from '@mantine/core';

import React, { useEffect } from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';
import JnAjax from '@/app/JnAjax';
import { WelcomeMessage } from '@/presentation/auth/WelcomeMessage';
import { LabelComponent } from '@/presentation/components/source/LabelComponent';
import { loginFieldsHelp } from '@/presentation/auth/LoginFieldsHelp';

export interface RequestEmailProps {}

export const RequestEmailFooter: React.FC<RequestEmailProps> = ({}) => {
    return <WelcomeMessage />;
};
export const RequestEmailClick = 'checkEmail';
export const RequestEmail: React.FC<RequestEmailProps> = ({}) => {
    const {lockedToken, email, setInvalid, setDetailMessage, setEmail, detailMessage, setLockedToken } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));

    const validateEmail = (value: string, oldError: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalid = !regex.test(value);
        const error = !value? `Favor informar um e-mail ao qual você tenha pleno acesso` :  invalid ? `O e-mail '${value}' está em formato inválido` : oldError;
        setInvalid(invalid);
        setEmail(value);
        setDetailMessage(error);
        !invalid && JnAjax.isCachedStatus(value, 'checkEmail', 403) && setLockedToken(true);
    };

    useEffect(() => {

        setDetailMessage(detailMessage);
        // o modal abre sem erro à mostra: o aviso só aparece depois que o usuário digita (até 2026-11-08 abria já em vermelho)
        if (!email) {
            setInvalid(true);
            return;
        }
        validateEmail(email, detailMessage);
    }, []);

    return (
        <LabelComponent explanation={loginFieldsHelp.email} labelValue="E-mail" property="loginEmail" errors={{}} stacked>
            <TextInput
                id="loginEmail"
                type="email"
                size="md"
                readOnly={lockedToken}
                value={email || ''}
                onChange={(e) => validateEmail(e.currentTarget.value, '')}
                placeholder="voce@exemplo.com"
                leftSection={<IconUser className="h-5 w-5" />}
                autoComplete="email"
                autoFocus
            />
        </LabelComponent>
    );
};
