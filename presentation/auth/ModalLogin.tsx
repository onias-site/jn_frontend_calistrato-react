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
    reasonMessage: string;
    email: string;
    context: any;
    // senhas/tokens já recusados nesta abertura do modal: ficam fora do context, que vai inteiro no corpo das
    // requisições (até 2026-11-10 iam em context.attempts e o 423 devolvia a senha digitada, defeito R05-2)
    wrongAttempts: string[];
    addWrongAttempt: (attempt: string) => void;
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
    showModal: (selectedScreen: string, title: string, retryAfterAuthenticationCallBack: any, detailMessage?: string, reasonMessage?: string) => void;
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
        const {context, setDetailMessage, setInvalid, wrongAttempts} = get();
        const value = context[fieldName];

        if(!wrongAttempts.includes(value)){
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
    showModal: (selectedScreen: string, title: string, retryAfterAuthenticationCallBack: any, detailMessage: string = '', reasonMessage: string = '') => {
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
            reasonMessage,
            callbacks,
            context: {},
            wrongAttempts: [],
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
    wrongAttempts: [],
    addWrongAttempt: (attempt: string) => set({ wrongAttempts: [...get().wrongAttempts, attempt] }),
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
            wrongAttempts: [],
            email: '',
            title: '',
            detailMessage: '',
            reasonMessage: '',
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
    reasonMessage: '',
}));

export const ModalLogin: React.FC<ModalLoginProps> = ({}) => {
    const { setLockedToken, lockedToken, invalid, title, selectedScreen, visible, dismissModal, showModal, email, loading, setDetailMessage, detailMessage, reasonMessage } = ModalLoginStore(
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
    const executeScreenAction = () => {
        setDetailMessage('');
        setLockedToken(false);
        estado.doAnAjaxRequest(screen.buttonClick);
    };

    // Enter no último campo do formulário executa o botão da tela (se estiver habilitado); nos demais campos não faz nada
    const handleEnter = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key != 'Enter' || e.defaultPrevented) {
            return;
        }
        const target = e.target as HTMLElement;
        if (target.tagName != 'INPUT') {
            return;
        }
        e.preventDefault();
        const fields = e.currentTarget.querySelectorAll('input:not([type=hidden])');
        const lastField = fields[fields.length - 1];
        if (target != lastField) {
            return;
        }
        if (lockedToken || invalid || loading) {
            return;
        }
        executeScreenAction();
    };

    return (
        <Modal title={title || screen.headerLabel} visible={visible} size="md" closeOnClickOutside={false} setVisible={(show) => (show ? showModal(selectedScreen, title) : dismissModal())}>
            <form onSubmit={(e) => e.preventDefault()} onKeyDown={handleEnter}>
                {/* o motivo de o usuário ter sido trazido a esta tela (login aberto em outro lugar, senha bloqueada): fica
                    à parte do detailMessage, que o envio do token e a validação dos campos reescrevem (até 2026-11-09 o
                    aviso do login concorrente era apagado pela resposta do envio do token assim que a tela abria) */}
                {reasonMessage && (
                    <div role="alert" className="mb-4 flex items-start gap-2 rounded-md border border-warning/30 bg-warning-light px-3 py-2.5 text-sm leading-snug text-warning dark:bg-warning-dark-light">
                        <span className="mt-0.5 shrink-0">
                            <IconInfoTriangle className="h-4 w-4" />
                        </span>
                        <span>{reasonMessage}</span>
                    </div>
                )}
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
                    onClick={executeScreenAction}
                />
            </form>
            {!lockedToken ? screen.footerComponent : <UnlockTokenLink />}
            {selectedScreen != 'RequestEmail' && <BackToLoginLink />}
        </Modal>
    );
};
