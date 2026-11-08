'use client';
import React, { useEffect } from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';
import IconUser from '@/presentation/icons/icon-user';
import { TextInput } from '@mantine/core';
import JnAjax from '@/app/JnAjax';
import { LabelComponent } from '@/presentation/components/source/LabelComponent';
import { loginFieldsHelp } from '@/presentation/auth/LoginFieldsHelp';

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
        <LabelComponent explanation={loginFieldsHelp.confirmEmail} labelValue="Confirme o e-mail" property="loginConfirmEmail" errors={{}} stacked>
            <TextInput
                id="loginConfirmEmail"
                type="email"
                size="md"
                readOnly={lockedToken}
                onChange={(e) => confirmEmail(e.currentTarget.value)}
                placeholder="Digite o e-mail de novo"
                leftSection={<IconUser className="h-5 w-5" />}
                autoComplete="email"
                autoFocus
            />
        </LabelComponent>
    );
};
