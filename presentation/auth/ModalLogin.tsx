'use client';
import { create } from 'zustand';
import React from 'react';
import { RequestEmail, RequestEmailFooter, RequestEmailClick } from '@/presentation/auth/RequestEmail';
import { ConfirmEmail, ConfirmEmailFooter, ConfirmEmailClick } from '@/presentation/auth/ConfirmEmail';
import {SavePassword, SavePasswordClick, SavePasswordFooter} from '@/presentation/auth/SavePassword';
import { RequestAnswers, RequestAnswersClick } from '@/presentation/auth/RequestAnswers';
import { LoadingButton } from '@/presentation/components/source/LoadingButton';
import { Modal } from '@/presentation/components/source/Modal';


export interface ModalLoginProps {}

export interface IModalLoginStore {
    retryAfterAuthentication: any;
    selectedScreen: string;
    visible: boolean;
    loading: boolean;
    callbacks: any;
    title: string;
    error: string;
    email: string;
    context: any;
    hideModal: () => void;
    setEmail: (email: string) => void;
    setError: (error: string) => void;
    setLoading: (loading: boolean) => void;
    executeRetryAfterAuthentication: () => void;
    setContextField: (key: string, value: any) => void;
    showModal: (selectedScreen: string, title: string, retryAfterAuthenticationCallBack: any) => void;
}

export const ModalLoginStore = create<IModalLoginStore>((set, get) => ({

    retryAfterAuthentication: null,
    executeRetryAfterAuthentication: () => {
        const {retryAfterAuthentication } = get();
        retryAfterAuthentication && retryAfterAuthentication();
        set({retryAfterAuthentication});
    },
    showModal: (selectedScreen: string, title: string, retryAfterAuthenticationCallBack: any) => {
        const { setError, setLoading, email, retryAfterAuthentication, executeRetryAfterAuthentication } = get();
        const retryAfter401 =  retryAfterAuthenticationCallBack || retryAfterAuthentication;
        const callbacks = {};
        callbacks['setLoading'] = () => setLoading(true);
        callbacks['setNotLoading'] = () => setLoading(false);
        callbacks['200'] = () => executeRetryAfterAuthentication();
        callbacks['400'] = () => setError(`O e-mail '${email}' é inválido`);

        set({ selectedScreen, title, visible: true, error: '', loading: false, callbacks, retryAfterAuthentication: retryAfter401});
    },
    context: {},
    setContextField: (key: string, value: any) => {
        const { context } = get();
        context[key] = value;
        set({context});
    },
    hideModal: () => set({ selectedScreen: 'RequestEmail', title: '', visible: false, error: '', loading: false }),
    setLoading: (loading: boolean) => set({ loading }),
    setEmail: (email: string) => set({ email }),
    setError: (error: string) => set({ error }),
    selectedScreen: 'RequestEmail',
    loading: false,
    visible: false,
    callbacks: {},
    title: '',
    email: '',
    error: '',
}));

export const ModalLogin: React.FC<ModalLoginProps> = ({}) => {
    const { title, selectedScreen, visible, hideModal, showModal, email, loading, callbacks, setError, error, context } = ModalLoginStore((state: IModalLoginStore) => ({
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
    };

    const screen = allScreens[selectedScreen];

    return (
        <Modal title={title || screen.headerLabel} visible={visible} setVisible={(show) => (show ? showModal(selectedScreen, title) : hideModal())}>
            <form>
                <div className="relative mb-4">
                    {screen.component}
                    {error && <p className="text-red-600">{error}</p>}
                </div>
                <LoadingButton label={screen.buttonLabel} loading={loading} onClick={() => screen.buttonClick(setError, showModal, callbacks, email, context)} />
            </form>
            {screen.footerComponent}
        </Modal>
    );
};
