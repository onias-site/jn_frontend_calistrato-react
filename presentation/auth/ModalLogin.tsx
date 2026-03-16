'use client';
import { create } from 'zustand';
import React from 'react';
import { RequestPassword, RequestPasswordClick, RequestPasswordFooter } from '@/presentation/auth/RequestPassword';
import { RequestEmail, RequestEmailFooter, RequestEmailClick } from '@/presentation/auth/RequestEmail';
import { ConfirmEmail, ConfirmEmailFooter, ConfirmEmailClick } from '@/presentation/auth/ConfirmEmail';
import {SavePassword, SavePasswordClick, SavePasswordFooter} from '@/presentation/auth/SavePassword';
import { RequestAnswers, RequestAnswersClick } from '@/presentation/auth/RequestAnswers';
import { LoadingButton } from '@/presentation/components/source/LoadingButton';
import { Modal } from '@/presentation/components/source/Modal';
import PubSub from 'pubsub-js';


export interface ModalLoginProps {}

export interface IModalLoginStore {
    retryAfterAuthentication: any;
    selectedScreen: string;
    visible: boolean;
    loading: boolean;
    invalid: boolean;
    callbacks: any;
    title: string;
    error: string;
    email: string;
    context: any;
    hideModal: () => void;
    setEmail: (email: string) => void;
    setError: (error: string) => void;
    setLoading: (loading: boolean) => void;
    setInvalid: (invalid: boolean) => void;
    setContextField: (key: string, value: any) => void;
    executeRetryAfterAuthentication: (response: any) => void;
    clearRetryAfterAuthentication: () => void;
    showModal: (selectedScreen: string, title: string, retryAfterAuthenticationCallBack: any) => void;
}

export const ModalLoginStore = create<IModalLoginStore>((set, get) => ({

    retryAfterAuthentication: null,

    clearRetryAfterAuthentication: () => set({retryAfterAuthentication: null}),

    executeRetryAfterAuthentication: (response: any) => {

        sessionStorage.setItem('login', JSON.stringify(response));
        const {retryAfterAuthentication , hideModal, email} = get();
        retryAfterAuthentication && retryAfterAuthentication();
        set({retryAfterAuthentication});
        PubSub.publish('showMessage', {summary: 'Sucesso!!!', detail: `O usuário '${email}' foi autenticado com sucesso!`});
        hideModal();
    },
    showModal: (selectedScreen: string, title: string, retryAfterAuthenticationCallBack: any, error: string) => {
        const { setError, setLoading, email, retryAfterAuthentication } = get();
        const retryAfter401 =  retryAfterAuthenticationCallBack || retryAfterAuthentication;
        const callbacks = {};
        callbacks['setLoading'] = () => setLoading(true);
        callbacks['setNotLoading'] = () => setLoading(false);
        callbacks['getLogin'] = () => {
            return {};
        };
        callbacks['400'] = () => setError(`O e-mail '${email}' é inválido`);

        set({ selectedScreen, title, visible: true, error, loading: false, callbacks, retryAfterAuthentication: retryAfter401});
    },
    context: {},
    setContextField: (key: string, value: any) => {
        const { context } = get();
        context[key] = value;
        set({context});
    },
    hideModal: () => set({invalid: false, selectedScreen: 'RequestEmail', title: '', visible: false, error: '', loading: false }),
    setLoading: (loading: boolean) => set({ loading }),
    setInvalid: (invalid: boolean) => set({invalid}),
    setEmail: (email: string) => set({ email }),
    setError: (error: string) => set({ error }),

    selectedScreen: 'RequestEmail',
    loading: false,
    invalid: false,
    visible: false,
    callbacks: {},
    title: '',
    email: '',
    error: '',
}));

export const ModalLogin: React.FC<ModalLoginProps> = ({}) => {
    const {invalid, executeRetryAfterAuthentication, title, selectedScreen, visible, hideModal, showModal, email, loading, callbacks, setError, error, context } = ModalLoginStore((state: IModalLoginStore) => ({
        ...state,
    }));

    const allScreens = {
        RequestEmail: {
            footerComponent: <RequestEmailFooter />,
            headerLabel: 'Verificação de e-mail',
            buttonClick: RequestEmailClick,
            component: <RequestEmail />,
            buttonLabel: 'Avançar',
        },
        SavePassword:{
            footerComponent: <SavePasswordFooter/>,
            headerLabel: 'Criar senha',
            buttonClick: SavePasswordClick,
            component: <SavePassword />,
            buttonLabel: 'Salvar senha',
        },
        RequestAnswers: {
            headerLabel: 'Informe suas preferências e objetivos' ,
            buttonClick: RequestAnswersClick,
            component: <RequestAnswers />,
            buttonLabel: 'Enviar',
        },
        ConfirmEmail: {
            headerLabel: `Por favor, confirme o e-mail '${email}'`,
            footerComponent: <ConfirmEmailFooter />,
            buttonClick: ConfirmEmailClick,
            component: <ConfirmEmail />,
            buttonLabel: 'Confirmar',
        },
        RequestPassword: {
            headerLabel: `Informe a senha para o login '${email}'`,
            footerComponent: <RequestPasswordFooter />,
            buttonClick: RequestPasswordClick,
            component: <RequestPassword />,
            buttonLabel: 'Login',
        },
    };

    const screen = allScreens[selectedScreen];

    return (
        <Modal title={title || screen.headerLabel} visible={visible} setVisible={(show) => (show ? showModal(selectedScreen, title) : hideModal())}>
            <form>
                <div className="relative mb-4">
                    {screen.component}
                    {error && <p className="text-red-600">{error}</p>}
                </div>
                <LoadingButton invalid={invalid} label={screen.buttonLabel} loading={loading} onClick={() => screen.buttonClick(setError, showModal, callbacks, email, context, executeRetryAfterAuthentication)} />
            </form>
            {screen.footerComponent}
        </Modal>
    );
};
