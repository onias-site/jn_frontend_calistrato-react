'use client';
import { create } from 'zustand';
import React from 'react';
import { RequestPassword, RequestPasswordClick, RequestPasswordFooter } from '@/presentation/auth/RequestPassword';
import { RequestEmail, RequestEmailFooter, RequestEmailClick } from '@/presentation/auth/RequestEmail';
import { ConfirmEmail, ConfirmEmailFooter, ConfirmEmailClick } from '@/presentation/auth/ConfirmEmail';
import { SavePassword, SavePasswordClick, SavePasswordFooter } from '@/presentation/auth/SavePassword';
import { RequestAnswers, RequestAnswersClick } from '@/presentation/auth/RequestAnswers';
import { UnlockTokenLink } from '@/presentation/auth/UnlockTokenLink';
import { LoadingButton } from '@/presentation/components/source/LoadingButton';
import { serverRequests } from '@/presentation/auth/ServerRequests';
import { Modal } from '@/presentation/components/source/Modal';
import JnAjax from '@/app/JnAjax';
import PubSub from 'pubsub-js';
import { BackToLoginLink } from '@/presentation/auth/BackToLoginLink';
import IconInfoTriangle from '@/presentation/icons/icon-info-triangle';
import IconInfoCircle from '@/presentation/icons/icon-info-circle';

export interface ModalLoginProps {}

export interface IModalLoginStore {
    retryAfterAuthentication: any;
    dismissAction: any;
    selectedScreen: string;
    lockedToken: boolean;
    visible: boolean;
    loading: boolean;
    invalid: boolean;
    callbacks: any;
    title: string;
    detailMessage: string;
    email: string;
    context: any;
    hideModal: () => void;
    dismissModal: () => void;
    setDismissAction: (dismissAction: any) => void;
    setEmail: (email: string) => void;
    setLoading: (loading: boolean) => void;
    setInvalid: (invalid: boolean) => void;
    clearRetryAfterAuthentication: () => void;
    doAnAjaxRequest: (requestName: string) => void;
    setLockedToken: (lockedToken: boolean) => void;
    setDetailMessage: (detailMessage: string) => void;
    setContextField: (key: string, value: any) => void;
    executeRetryAfterAuthentication: (response: any) => void;
    isInvalidAttempt: (fieldName: string, phrase: string) => any;
    showModal: (selectedScreen: string, title: string, retryAfterAuthenticationCallBack: any) => void;
}

export const ModalLoginStore = create<IModalLoginStore>((set, get) => ({
    retryAfterAuthentication: null,

    // o que fazer quando o usuário fecha o modal sem entrar (o login com sucesso não a executa); hideModal a limpa
    dismissAction: null,

    setDismissAction: (dismissAction: any) => set({ dismissAction }),

    dismissModal: () => {
        const { dismissAction, hideModal } = get();
        hideModal();
        dismissAction && dismissAction();
    },

    lockedToken: false,

    isInvalidAttempt: (fieldName: string, phrase: string) => {
        const {context, setDetailMessage, setInvalid} = get();
        const value = context[fieldName];
        context.attempts = context.attempts || [];

        if(!context.attempts.includes(value)){
            return false;
        }

        setDetailMessage(phrase);
        setInvalid(true);
        return true;

    },

    doAnAjaxRequest: (requestName: string) => JnAjax.executeLoginRequest(get(), requestName, serverRequests),

    setLockedToken: (lockedToken: boolean) => set({ lockedToken, invalid: true }),

    clearRetryAfterAuthentication: () => set({ retryAfterAuthentication: null }),

    executeRetryAfterAuthentication: (response: any) => {
        JnAjax.saveLogin(response);

        const { retryAfterAuthentication, hideModal, email } = get();
        retryAfterAuthentication && retryAfterAuthentication();
        set({ retryAfterAuthentication });
        PubSub.publish('showMessage', { summary: 'Sucesso!!!', detail: `O usuário '${email}' foi autenticado com sucesso!` });
        hideModal();
    },
    showModal: (selectedScreen: string, title: string, retryAfterAuthenticationCallBack: any, detailMessage: string) => {
        const { setDetailMessage, setLoading, email, retryAfterAuthentication, setLockedToken } = get();
        const retryAfter401 = retryAfterAuthenticationCallBack || retryAfterAuthentication;
        const callbacks = {};
        callbacks['setLoading'] = () => setLoading(true);
        callbacks['setNotLoading'] = () => setLoading(false);
        callbacks['getLogin'] = () => {
            return {};
        };
        const login = JnAjax.getLogin();
        const email2 = email || login.email;
        set({
            title,
            detailMessage,
            callbacks,
            context: {},
            visible: true,
            email: email2,
            invalid: false,
            loading: false,
            selectedScreen,
            lockedToken: false,
            retryAfterAuthentication: retryAfter401,
        });
    },
    context: {},
    setContextField: (key: string, value: any) => {
        const { context } = get();
        context[key] = value;
        set({ context });
    },
    hideModal: () => {
        set({
            retryAfterAuthentication: null,
            dismissAction: null,
            selectedScreen: 'RequestEmail',
            lockedToken: false,
            invalid: false,
            visible: false,
            loading: false,
            callbacks: {},
            context: {},
            email: '',
            title: '',
            detailMessage: '',
        });
        document.getElementById('cover').style.display = 'none';
    },
    setLoading: (loading: boolean) => set({ loading }),
    setInvalid: (invalid: boolean) => set({ invalid }),
    setEmail: (email: string) => set({ email }),
    setDetailMessage: (detailMessage: string) => set({ detailMessage }),

    selectedScreen: 'RequestEmail',
    loading: false,
    invalid: false,
    visible: false,
    callbacks: {},
    title: '',
    email: '',
    detailMessage: '',
}));

export const ModalLogin: React.FC<ModalLoginProps> = ({}) => {
    const { setLockedToken, lockedToken, invalid, title, selectedScreen, visible, dismissModal, showModal, email, loading, setDetailMessage, detailMessage } = ModalLoginStore(
        (state: IModalLoginStore) => ({
            ...state,
        })
    );
    const estado = ModalLoginStore((state: IModalLoginStore) => ({
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
        SavePassword: {
            footerComponent: <SavePasswordFooter />,
            headerLabel: 'Criando uma nova senha',
            buttonClick: SavePasswordClick,
            component: <SavePassword />,
            buttonLabel: 'Salvar senha',
        },
        RequestAnswers: {
            headerLabel: 'Informe suas preferências e objetivos',
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
    const disabledDiv = {
        pointerEvents: 'none',
        opacity: 0.6,
        cursor: 'not-allowed',
    };
    return (
        <Modal title={title || screen.headerLabel} visible={visible} size="md" setVisible={(show) => (show ? showModal(selectedScreen, title) : dismissModal())}>
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="relative mb-4" style={lockedToken ? disabledDiv : {}}>
                    {screen.component}
                    {/* a mesma caixa serve para o erro (vermelha) e para as orientações, como o aviso de token enviado (azul) */}
                    {detailMessage && (
                        <div
                            role={invalid ? 'alert' : 'status'}
                            className={`-mt-2 mb-4 flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm leading-snug ${
                                invalid ? 'border-danger/30 bg-danger-light text-danger dark:bg-danger-dark-light' : 'border-info/30 bg-info-light text-info dark:bg-info-dark-light'
                            }`}
                        >
                            <span className="mt-0.5 shrink-0">{invalid ? <IconInfoTriangle className="h-4 w-4" /> : <IconInfoCircle className="h-4 w-4" />}</span>
                            <span>{detailMessage}</span>
                        </div>
                    )}
                </div>
                <LoadingButton
                    invalid={lockedToken || invalid}
                    label={screen.buttonLabel}
                    loading={loading}
                    onClick={() => {
                        setDetailMessage('');
                        setLockedToken(false);
                        estado.doAnAjaxRequest(screen.buttonClick);
                    }}
                />
            </form>
            {!lockedToken ? screen.footerComponent : <UnlockTokenLink />}
            {selectedScreen != 'RequestEmail' && <BackToLoginLink />}
        </Modal>
    );
};
