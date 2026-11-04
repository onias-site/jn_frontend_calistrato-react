'use client';
import React, { useEffect, useState } from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';
import { LabelComponent } from '@/presentation/components/source/LabelComponent';
import { loginFieldsHelp } from '@/presentation/auth/LoginFieldsHelp';
import { ResendTokenLink } from '@/presentation/auth/ResendTokenLink';
import { PasswordField } from '@/presentation/auth/PasswordField';
import { TextInput } from '@mantine/core';
export const SavePasswordClick = 'savePassword';

export interface SavePasswordProps {}

export const SavePasswordFooter: React.FC<any> = ({}) => {
    return (
        <div className="border-t border-[#ebe9f1] p-5 dark:border-white/10">
            <ResendTokenLink />
        </div>
    );
};

export const SavePassword: React.FC<SavePasswordProps> = ({}) => {
    const { isInvalidAttempt, setInvalid, email, context, setContextField, doAnAjaxRequest, setDetailMessage, detailMessage } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));
        const [wrongTokens, setWrongTokens] = useState([]);

    useEffect(() => {
        // começa desabilitado: os três campos estão vazios
        setInvalid(true);
        doAnAjaxRequest('sendToken');
    }, []);

    const fieldErrors = {};

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    const setField = (setter: any, erro: string) => {
        setter();
        const invalidPassword = context.password && !passwordRegex.test(context.password);
        if (invalidPassword) {
            !erro && setDetailMessage('A senha está inválida, ela deve conter ao menos 8 caractéres, ao menos uma letra maiúscula, ao menos um número e ao menos um caractere especial');
            setInvalid(true);
            return;
        }

        const invalidConfirmPassword = context.confirmPassword && !passwordRegex.test(context.confirmPassword);
        if (invalidConfirmPassword) {
            !erro && setDetailMessage('A confirmação de senha está inválida, ela deve conter ao menos 8 caractéres, ao menos uma letra maiúscula, ao menos um número e ao menos um caractere especial');
            setInvalid(true);
            return;
        }

        const passwordNotEquals = context.password && context.confirmPassword && context.password != context.confirmPassword;
        if (passwordNotEquals) {
            !erro && setDetailMessage('As duas senhas não são iguais');
            setInvalid(true);
            return;
        }

        const invalidToken = context.token && context.token.length != 8;
        if (invalidToken) {
            !erro && setDetailMessage('Token não digitado corretamente, ele deve conter exatamente 8 caracteres');
            setInvalid(true);
            return;
        }
        !erro && setDetailMessage('');
        if (!context.password) {
            !erro && setDetailMessage('Informe a senha, ela deve conter ao menos 8 caractéres, ao menos uma letra maiúscula, ao menos um número e ao menos um caractere especial');
            setInvalid(true);
            return;
        }

        if (!context.confirmPassword) {
            !erro && setDetailMessage('Informe a confirmação de senha, ela deve conter ao menos 8 caractéres, ao menos uma letra maiúscula, ao menos um número e ao menos um caractere especial');
            setInvalid(true);
            return;
        }

        if (!context.token) {
            !erro && setDetailMessage('Informe o token, ele deve conter exatamente 8 caracteres');
            setInvalid(true);
            return;
        }

        if(isInvalidAttempt('token', 'Este token já foi digitado antes e está incorreto, tente outro!')){
            return;
        }

        setInvalid(false);
    };


    const setToken = (value: string) => {
        if (wrongTokens.includes(value)) {
            setField(() => setContextField('token', ''), `Este valor já foi digitado e não é válido, por favor, verifique o token recebido no e-mail '${email}'`);
            return;
        }
        setField(() => setContextField('token', value), '');
    }

    return (
        <div className="relative">
            <LabelComponent explanation={loginFieldsHelp.newPassword} labelValue="Senha:" property="loginPassword" errors={fieldErrors} stacked>
                <PasswordField id="loginPassword" placeholder="Digite uma senha" value={context.password} onChange={(value) => setField(() => setContextField('password', value), '')} withStrength />
            </LabelComponent>
            <LabelComponent
                explanation={loginFieldsHelp.confirmPassword}
                labelValue="Confirme a senha:"
                property="loginConfirmPassword"
                errors={fieldErrors}
                stacked
            >
                <PasswordField id="loginConfirmPassword" placeholder="Confirme a senha" value={context.confirmPassword} onChange={(value) => setField(() => setContextField('confirmPassword', value), '')} />
            </LabelComponent>
            <LabelComponent explanation={loginFieldsHelp.token(email)} labelValue={`Token recebido no e-mail '${email}':`} property="loginToken" errors={fieldErrors} stacked>
                <TextInput
                    id="loginToken"
                    value={context.token || ''}
                    placeholder="8 letras ou números, como no e-mail"
                    maxLength={8}
                    autoComplete="one-time-code"
                    className="font-mono uppercase tracking-widest"
                    onChange={(e) => setToken(e.currentTarget.value.toUpperCase())}
                />
            </LabelComponent>
        </div>
    );
};
