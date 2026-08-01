'use client';
import { create } from 'zustand';
import React from 'react';
import { RequestPassword, RequestPasswordClick, RequestPasswordFooter } from '@/presentation/auth/RequestPassword';
import { RequestEmail, RequestEmailFooter, RequestEmailClick } from '@/presentation/auth/RequestEmail';
import { ConfirmEmail, ConfirmEmailFooter, ConfirmEmailClick } from '@/presentation/auth/ConfirmEmail';
import { SavePassword, SavePasswordClick, SavePasswordFooter } from '@/presentation/auth/SavePassword';
import { RequestAnswers, RequestAnswersClick } from '@/presentation/auth/RequestAnswers';
import { LoadingButton } from '@/presentation/components/source/LoadingButton';
import { serverRequests } from '@/presentation/auth/ServerRequests';
import { Modal } from '@/presentation/components/source/Modal';
import JnAjax from '@/app/JnAjax';
import PubSub from 'pubsub-js';

export interface ModalLoginProps {}

export interface IModalLoginStore {
    retryAfterAuthentication: any;
    selectedScreen: string;
    lockedToken: boolean;
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
    notifyAboutLoginNotFound: () => void;
    setLoading: (loading: boolean) => void;
    setInvalid: (invalid: boolean) => void;
    doAnAjaxRequest: (requestName: string) => void;
    clearRetryAfterAuthentication: () => void;
    setLockedToken: (lockedToken: boolean) => void;
    setContextField: (key: string, value: any) => void;
    executeRetryAfterAuthentication: (response: any) => void;
    showModal: (selectedScreen: string, title: string, retryAfterAuthenticationCallBack: any) => void;
}

export const ModalLoginStore = create<IModalLoginStore>((set, get) => ({
    retryAfterAuthentication: null,
    lockedToken: false,
    doAnAjaxRequest: (requestName: string) =>{
        const {email} = get();
        const requestDetails = serverRequests[requestName];

        if(requestDetails.mustInterruptRequest() === true){
            return;
        }

        const tokenStatus = JnAjax.getLoginStatus(email, requestName, requestDetails.cached);

        if(tokenStatus){
            return;
        }

        requestDetails.callbacks.onUnexpectedHttpStatus = (response: any, status: any) => requestDetails.cached[status](response) || JnAjax.setLoginStatus(email, requestName, status, response);

        JnAjax.doAnAjaxRequest(requestDetails.url, requestDetails.callbacks, requestDetails.method, requestDetails.getBody(), {}, 'http://localhost:8080');

    },
    notifyAboutLoginNotFound: () => {
        const {email, showModal} = get();
        JnAjax.removeLogin(email);
        showModal('RequestEmail', '', null, 'O seu login não foi encontrado, por favor, informe um e-mail');
    },
    setLockedToken: (lockedToken: boolean) => set({ lockedToken, invalid: true }),

    clearRetryAfterAuthentication: () => set({ retryAfterAuthentication: null }),

    executeRetryAfterAuthentication: (response: any) => {

        const loginToSessionStorage = {
            email: response.email,
            sessionToken: response.sessionToken,
            timestamp: response.timestamp,
            expirationDate: response.expirationDate,
            dateItWasSaved: response.dateItWasSaved,
        };


        const loginToLocalStorage = (response.timestamp && response.expirationDate && response.dateItWasSaved)
        && {
            timestamp: response.timestamp,
            expirationDate: response.expirationDate,
            dateItWasSaved: response.dateItWasSaved,
            stagesOvercome: ['email', 'token', 'password']
        };

        const array = localStorage.getItem('logins');
        let logins = {};
        try {
            logins = JSON.parse(array) ||{};
            const loginLoadedFromLocalStorage = loginToLocalStorage || logins[response.email];
            logins[response.email] = loginLoadedFromLocalStorage;
            localStorage.setItem('logins', JSON.stringify(logins));

        } catch (error) {
            console.error(error);
        }

        sessionStorage.setItem('login', JSON.stringify(loginToSessionStorage));

        const { retryAfterAuthentication, hideModal, email } = get();
        retryAfterAuthentication && retryAfterAuthentication();
        set({ retryAfterAuthentication });
        PubSub.publish('showMessage', { summary: 'Sucesso!!!', detail: `O usuário '${email}' foi autenticado com sucesso!` });
        hideModal();
    },
    showModal: (selectedScreen: string, title: string, retryAfterAuthenticationCallBack: any, error: string) => {
        const { setError, setLoading, email, retryAfterAuthentication, setLockedToken } = get();
        const retryAfter401 = retryAfterAuthenticationCallBack || retryAfterAuthentication;
        const callbacks = {};
        callbacks['setLoading'] = () => setLoading(true);
        callbacks['setNotLoading'] = () => setLoading(false);
        callbacks['getLogin'] = () => {
            return {};
        };
        callbacks['400'] = () => setError(`O e-mail '${email}' é inválido`);
        callbacks['403'] = () => setLockedToken(true);
        const login = JnAjax.getLogin();
        const email2 = email || login.email;
        set({
            title,
            error,
            callbacks,
            context: {},
            visible: true,
            email: email2,
            invalid: false,
            loading: false,
            selectedScreen,
            lockedToken: false,
            retryAfterAuthentication: retryAfter401
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
            selectedScreen: 'RequestEmail',
            lockedToken: false,
            invalid: false,
            visible: false,
            loading: false,
            callbacks: {},
            context: {},
            email: '',
            title: '',
            error: '',
        });
        document.getElementById('cover').style.display = 'none';
    },
    setLoading: (loading: boolean) => set({ loading }),
    setInvalid: (invalid: boolean) => set({ invalid }),
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
    const { setLockedToken, lockedToken, invalid, title, selectedScreen, visible, hideModal, showModal, email, loading, setError, error } =
        ModalLoginStore((state: IModalLoginStore) => ({
            ...state,
        }));
        const estado =  ModalLoginStore((state: IModalLoginStore) => ({
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
            headerLabel: 'Criar senha',
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

    return (
        <Modal title={title || screen.headerLabel} visible={visible} setVisible={(show) => (show ? showModal(selectedScreen, title) : hideModal())}>
            <form>
                <div className="relative mb-4">
                    {screen.component}
                    {error && <p className="text-red-600">{error}</p>}
                </div>
                <LoadingButton
                    invalid={lockedToken || invalid}
                    label={screen.buttonLabel}
                    loading={loading}
                    onClick={() => {
                        setError('');
                        setLockedToken(false);
                       estado.doAnAjaxRequest(screen.buttonClick);
                    }}
                />
            </form>
            {!lockedToken ? (
                screen.footerComponent
            ) : (
                <div className="border-t border-[#ebe9f1] p-5 dark:border-white/10">
                    <p className="text-center text-sm text-red-600 dark:text-white-dark/70">
                        Seu token está bloqueado!
                        <button onClick={() => estado.doAnAjaxRequest('requestUnlockToken')} type="button" className="text-[#515365] hover:underline ltr:ml-1 rtl:mr-1 dark:text-white-dark">
                            Clique aqui para solicitar desbloqueio
                        </button>
                    </p>
                </div>
            )}
        </Modal>
    );
};
