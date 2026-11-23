'use client';
import React, { useEffect, useRef } from 'react';
import PubSub from 'pubsub-js';
import JnAjax from '@/app/JnAjax';
import { ModalLoginStore, IModalLoginStore } from '@/presentation/auth/ModalLogin';
import './NotLoggedMessage.css';

type Props = {
    // o texto antes e depois do link "faça login"
    before: string;
    after: string;
    // a busca da tela, refeita depois de autenticar
    onLoggedIn: () => void;
    // abre o modal de login de outro jeito (ex.: já com o e-mail do destinatário); sem ela, o modal comum
    openLogin?: () => void;
};

/**
 * Faixa de quem não está logado, a mesma de "Sobre mim" (desde 2026-11-23): entrar na tela não abre o modal de login;
 * o link "faça login" o abre e, depois de autenticar, a busca da tela é refeita. Quem entra pelo menu do header também vê
 * a tela carregar: quando o modal fecha com sessão válida e a faixa ainda está na tela, a busca é refeita. Só a transição
 * do modal de aberto para fechado conta: com a sessão expirada guardada, a montagem não pode repetir a busca sem fim.
 */
export const NotLoggedMessage = ({ before, after, onLoggedIn, openLogin }: Props) => {
    const loginModalVisible = ModalLoginStore((state: IModalLoginStore) => state.visible);
    const wasVisible = useRef(loginModalVisible);
    useEffect(() => {
        const closed = wasVisible.current && !loginModalVisible;
        wasVisible.current = loginModalVisible;
        if (closed && JnAjax.hasLogin()) {
            onLoggedIn();
        }
    }, [loginModalVisible]);

    const openLoginModal = (event: React.MouseEvent) => {
        event.preventDefault();
        if (openLogin) {
            openLogin();
            return;
        }
        PubSub.publish('httpStatus401', onLoggedIn);
    };

    return (
        <div className="not-logged-message">
            {before}{' '}
            <a href="#" onClick={openLoginModal} className="not-logged-message-link">
                faça login
            </a>{' '}
            {after}
        </div>
    );
};
