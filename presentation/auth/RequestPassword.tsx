'use client';
import React from 'react';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';
import { Password } from 'primereact/password';
import { LabelComponent } from '@/presentation/components/source/LabelComponent';

export const RequestPasswordClick = 'requestPassword';

export interface RequestPasswordProps {}

export const RequestPasswordFooter: React.FC<any> = ({}) => {
    const {showModal } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));

    return (
        <div className="border-t border-[#ebe9f1] p-5 dark:border-white/10">
            <p className="text-center text-sm text-white-dark dark:text-white-dark/70">
                Esqueceu sua senha?
                <button onClick= {() => showModal('SavePassword', 'Refazer sua senha', null, 'Preencha os campos para refazer a sua senha')} type="button" className="text-[#515365] hover:underline ltr:ml-1 rtl:mr-1 dark:text-white-dark">
                    Clique aqui!
                </button>
            </p>
        </div>
    );
};

export const RequestPassword: React.FC<RequestPasswordProps> = ({}) => {
    const {setInvalid, context, setContextField, setDetailMessage, isInvalidAttempt } = ModalLoginStore((state: IModalLoginStore) => ({
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
            !erro && setDetailMessage('A senha está inválida, ela deve conter ao menos 8 caractéres, ao menos uma letra maiúscula, ao menos um número e ao menos um caractere especial');
            setInvalid(true);
            return;
        }
        !erro && setDetailMessage('');

        if(!context.password){
            !erro && setDetailMessage('Informe a senha, ela deve conter ao menos 8 caractéres, ao menos uma letra maiúscula, ao menos um número e ao menos um caractere especial');
            setInvalid(true);
            return;
        }
        if(isInvalidAttempt('password', 'Esta senha já foi digitada antes e está incorreta, tente outra senha!')){
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
