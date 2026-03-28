'use client';
import JnAjax from '@/app/JnAjax';
import React from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';
import { Password } from 'primereact/password';
import { LabelComponent } from '@/presentation/components/source/LabelComponent';

export const RequestPasswordClick = (setError: any, showModal: any, callbacks: any, email: string, context: any, executeRetryAfterAuthentication : any) => {
    const openModal = (selectedScreen: string) => showModal(selectedScreen, '');

    callbacks['201'] = () => openModal('RequestAnswers');
    callbacks['200'] = (response: any) => executeRetryAfterAuthentication(response);
    callbacks['404'] = () => showModal('RequestEmail', '', null, 'O seu login não foi encontrado, por favor, informe um e-mail');
    callbacks['427'] = (response: any) => setError(`Sua senha está incorreta!!! Você ainda tem direito a ${3 - response.attempts} tentativa(s)`);
    callbacks['423'] = () => showModal('SavePassword', 'Desbloqueie a sua senha', null, 'Devido a tentativas de acessos suspeitos, sua senha foi preventivamente bloqueada. Preencha os campos acima, para desbloqueá-la.');
    callbacks['429'] = () => showModal('SavePassword', 'Desbloqueie a sua senha', null, 'Devido a tentativas de acessos suspeitos, sua senha foi preventivamente bloqueada. Preencha os campos acima, para desbloqueá-la.');
    JnAjax.doAnAjaxRequest(`login/${email}`, callbacks, 'POST', context, {}, 'http://localhost:8080');
};

export interface RequestPasswordProps {}

export const RequestPasswordFooter: React.FC<any> = ({}) => {
    const {showModal } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));

    return (
        <div className="border-t border-[#ebe9f1] p-5 dark:border-white/10">
            <p className="text-center text-sm text-white-dark dark:text-white-dark/70">
                Quer trocar a senha?
                <button onClick= {() => showModal('SavePassword', 'Troque sua senha', null, 'Preencha os campos para atualizar sua senha')} type="button" className="text-[#515365] hover:underline ltr:ml-1 rtl:mr-1 dark:text-white-dark">
                    clique aqui!
                </button>
            </p>
        </div>
    );
};

export const RequestPassword: React.FC<RequestPasswordProps> = ({}) => {
    const {setInvalid, context, setContextField, setError } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));

    const fieldErrors = {};
    const passwordOptions = {
        mediumLabel: 'Senha de força média',
        strongLabel: 'Senha difícil de descobrir',
        weakLabel: 'Senha fácil de descobrir',
    };

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    const setField = (setter: any, erro: string) => {
        setter();
        const invalidPassword = context.password && !passwordRegex.test(context.password);
        if(invalidPassword){
            !erro && setError('A senha está inválida, ela deve conter ao menos 8 caractéres, ao menos uma letra maiúscula, ao menos um número e ao menos um caractere especial');
            setInvalid(true);
            return;
        }
        !erro && setError('');

        if(!context.password){
            !erro && setError('Informe a senha, ela deve conter ao menos 8 caractéres, ao menos uma letra maiúscula, ao menos um número e ao menos um caractere especial');
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
                 onChange={ (e) =>  setField(() => setContextField('password', e.target.value), '')} toggleMask />
            </LabelComponent>
        </div>
    );
};
