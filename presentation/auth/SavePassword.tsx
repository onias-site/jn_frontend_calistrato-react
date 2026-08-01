'use client';
import React, { useEffect, useState } from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';
import { Password } from 'primereact/password';
import { LabelComponent } from '@/presentation/components/source/LabelComponent';
import { serverRequests } from '@/presentation/auth/ServerRequests';

export const SavePasswordClick = 'savePassword';

export interface SavePasswordProps {}

export const SavePasswordFooter: React.FC<any> = ({}) => {
    const {loading, doAnAjaxRequest} = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));

    return (
        <div className="border-t border-[#ebe9f1] p-5 dark:border-white/10">
            {!loading && (
                <p className="text-center text-sm text-white-dark dark:text-white-dark/70">
                    Não recebeu ou perdeu o token?
                    <button onClick={() => doAnAjaxRequest('requestResendToken')} type="button" className="text-[#515365] hover:underline ltr:ml-1 rtl:mr-1 dark:text-white-dark">
                        Clique aqui para reenviar
                    </button>
                </p>
            )}
        </div>
    );
};

export const SavePassword: React.FC<SavePasswordProps> = ({}) => {
    const { setInvalid, email, context, setContextField, doAnAjaxRequest, setError, error } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));

    useEffect(() => {
        serverRequests.sendToken.afterHttpRequest = () => setField(() => {}, error);
        doAnAjaxRequest('sendToken');
    }, []);

    const fieldErrors = {};
    const passwordOptions = {
        mediumLabel: 'Senha de força média',
        strongLabel: 'Senha difícil de descobrir',
        weakLabel: 'Senha fácil de descobrir',
    };

    const emptyPasswordOptions = {
        mediumLabel: 'Token com formato inválido',
        strongLabel: 'Token com formato válido',
        weakLabel: 'Token com formato inválido',
        weakRegex: '^(?![A-Z0-9]{8}$).+',
        strongRegex: '^[A-Z0-9]{8}$',
        mediumRegex: '^(?![A-Z0-9]{8}$).+',
        promptLabel: `Informe o token recebido no e-mail '${email}'`,
    };

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    const setField = (setter: any, erro: string) => {
        setter();
        const invalidPassword = context.password && !passwordRegex.test(context.password);
        if (invalidPassword) {
            !erro && setError('A senha está inválida, ela deve conter ao menos 8 caractéres, ao menos uma letra maiúscula, ao menos um número e ao menos um caractere especial');
            setInvalid(true);
            return;
        }

        const invalidConfirmPassword = context.confirmPassword && !passwordRegex.test(context.confirmPassword);
        if (invalidConfirmPassword) {
            !erro && setError('A confirmação de senha está inválida, ela deve conter ao menos 8 caractéres, ao menos uma letra maiúscula, ao menos um número e ao menos um caractere especial');
            setInvalid(true);
            return;
        }

        const passwordNotEquals = context.password && context.confirmPassword && context.password != context.confirmPassword;
        if (passwordNotEquals) {
            !erro && setError('As duas senhas não são iguais');
            setInvalid(true);
            return;
        }

        const invalidToken = context.token && context.token.length != 8;
        if (invalidToken) {
            !erro && setError('Token não digitado corretamente, ele deve conter exatamente 8 caracteres');
            setInvalid(true);
            return;
        }
        !erro && setError('');
        if (!context.password) {
            !erro && setError('Informe a senha, ela deve conter ao menos 8 caractéres, ao menos uma letra maiúscula, ao menos um número e ao menos um caractere especial');
            setInvalid(true);
            return;
        }

        if (!context.confirmPassword) {
            !erro && setError('Informe a confirmação de senha, ela deve conter ao menos 8 caractéres, ao menos uma letra maiúscula, ao menos um número e ao menos um caractere especial');
            setInvalid(true);
            return;
        }

        if (!context.token) {
            !erro && setError('Informe o token, ele deve conter exatamente 8 caracteres');
            setInvalid(true);
            return;
        }
        setInvalid(false);
    };

    const explanation = 'Informe a senha para ser salva, ela deve ter 8 caracteres (no mínimo), ao menos um deles deve, necessariamente, ser maiúsculo e deve ter ao menos um caractere especial';
    return (
        <div className="relative">
            <LabelComponent explanation={explanation} labelValue="Senha:" property="password" errors={fieldErrors}>
                <Password {...passwordOptions} promptLabel="Digite uma senha" value={context.password} onChange={(e) => setField(() => setContextField('password', e.target.value), '')} toggleMask />
            </LabelComponent>
            <LabelComponent
                explanation="A senha a ser digitada neste campo deve ser a mesma senha digitada no campo anterior"
                labelValue="Confirme a senha:"
                property="confirmPassword"
                errors={fieldErrors}
            >
                <Password
                    {...passwordOptions}
                    promptLabel="Confirme a senha"
                    value={context.confirmPassword}
                    onChange={(e) => setField(() => setContextField('confirmPassword', e.target.value), '')}
                    toggleMask
                />
            </LabelComponent>
            <LabelComponent explanation={error} labelValue={`Token recebido no e-mail '${email}':`} property="token" errors={fieldErrors}>
                <Password {...emptyPasswordOptions} value={context.token} onChange={(e) => setField(() => setContextField('token', e.target.value), '')} toggleMask />
            </LabelComponent>
        </div>
    );
};
