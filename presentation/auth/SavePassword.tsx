'use client';
import JnAjax from '@/app/JnAjax';
import React, { useState, useEffect } from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';
import { Password } from 'primereact/password';
import { LabelComponent } from '@/presentation/components/source/LabelComponent';

export const SavePasswordClick = (setError: any, showModal: any, callbacks: any, email: string, context: any, executeRetryAfterAuthentication : any) => {
    const openModal = (selectedScreen: string) => showModal(selectedScreen, '');

    setError('');
    callbacks['404'] = () => openModal('RequestEmail');
    callbacks['201'] = () => openModal('RequestAnswers');
    callbacks['200'] = () => executeRetryAfterAuthentication();
    callbacks['421'] = () => setError('O token informado está incorreto');
    callbacks['403'] = () => setError('Seu token está bloqueado, por favor, tente novamente em 24 horas');
        JnAjax.doAnAjaxRequest(`login/${email}/password`, callbacks, 'POST', context, {}, 'http://localhost:8080');
};

export interface SavePasswordProps {}

export const SavePasswordFooter: React.FC<any> = ({}) => {
    return (
        <div className="border-t border-[#ebe9f1] p-5 dark:border-white/10">
            <p className="text-center text-sm text-white-dark dark:text-white-dark/70">
                Não recebeu o Token?
                <button type="button" className="text-[#515365] hover:underline ltr:ml-1 rtl:mr-1 dark:text-white-dark">
                    reenvie aqui
                </button>
            </p>
        </div>
    );
};

export const SavePassword: React.FC<SavePasswordProps> = ({}) => {
    const {setInvalid, email, context, setContextField, setError, callbacks, showModal, error } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));


    useEffect(() => {
        setError('');
        callbacks['404'] = () => showModal('RequestEmail', '');
        callbacks['403'] = () => setError('Seu token está bloqueado, por favor, tente novamente em 24 horas');

        // callbacks['429'] = () => setError(`Seu token já foi previamente enviado ao e-mail '${email}'. Por favor, verifique sua caixa de entrada e sua caixa de spam / lixo eletrônico`);
        callbacks['afterHttpRequest'] = () => {
            delete callbacks['422'];
            // !error && setField(() => {});
        };
        JnAjax.doAnAjaxRequest(`login/${email}/token/language/portuguese`, callbacks, 'POST', {}, {}, 'http://localhost:8080');
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
        promptLabel: `Informe o token recebido no e-mail '${email}'`
    };

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    const setField = (setter: any) => {
        setter();
        const invalidPassword = context.password && !passwordRegex.test(context.password);
        if(invalidPassword){
            setError('A senha está inválida, ela deve conter ao menos 8 caractéres, ao menos uma letra maiúscula, ao menos um número e ao menos um caractere especial');
            setInvalid(true);
            return;
        }

        const invalidConfirmPassword = context.confirmPassword && !passwordRegex.test(context.confirmPassword);
        if(invalidConfirmPassword){
            setError('A confirmação de senha está inválida, ela deve conter ao menos 8 caractéres, ao menos uma letra maiúscula, ao menos um número e ao menos um caractere especial');
            setInvalid(true);
            return;
        }

        const passwordNotEquals = context.password && context.confirmPassword && context.password != context.confirmPassword;
        if(passwordNotEquals){
            setError('As duas senhas não são iguais');
            setInvalid(true);
            return;
        }

        const invalidToken = context.token && context.token.length != 8;
        if(invalidToken){
            setError('Token não digitado corretamente, ele deve conter exatamente 8 caracteres');
            setInvalid(true);
            return;
        }
        setError('');

        if(!context.password){
            setError('Informe a senha, ela deve conter ao menos 8 caractéres, ao menos uma letra maiúscula, ao menos um número e ao menos um caractere especial');
            setInvalid(true);
            return;
        }

        if(!context.confirmPassword){
            setError('Informe a confirmação de senha, ela deve conter ao menos 8 caractéres, ao menos uma letra maiúscula, ao menos um número e ao menos um caractere especial');
            setInvalid(true);
            return;
        }

        if(!context.token){
            setError('Informe o token, ele deve conter exatamente 8 caracteres');
            setInvalid(true);
            return;
        }



        setInvalid(false);
    };


    const explanation = 'Informe a senha para ser salva, ela deve ter 8 caracteres (no mínimo), ao menos um deles deve, necessariamente, ser maiúsculo e deve ter ao menos um caractere especial';
    return (
        <div className="relative">
            <LabelComponent explanation={explanation} labelValue="Senha:" property="password" errors={fieldErrors}>
                <Password
                 {...passwordOptions}
                 promptLabel= "Digite uma senha"
                 value={context.password}
                 onChange={ (e) =>  setField(() => setContextField('password', e.target.value))} toggleMask />
            </LabelComponent>
            <LabelComponent explanation="A senha a ser digitada neste campo deve ser a mesma senha digitada no campo anterior"  labelValue="Confirme a senha:" property="confirmPassword" errors={fieldErrors}>
                <Password
                {...passwordOptions}
                promptLabel= "Confirme a senha"
                value={context.confirmPassword}
                onChange={(e) => setField(() => setContextField('confirmPassword', e.target.value))}
                toggleMask />
            </LabelComponent>
            <LabelComponent explanation={`Informe o token que você recebeu pelo e-mail '${email}'. Este token deve ter exatamente 8 caracteres maiúsculos, podendo ser alfanuméricos.`} labelValue={`Token recebido no e-mail '${email}':`} property="token" errors={fieldErrors}>
                <Password
                {...emptyPasswordOptions}
                value={context.token}
                onChange={(e) => setField(() => setContextField('token', e.target.value))}
                toggleMask />
            </LabelComponent>
        </div>
    );
};
