'use client';
import React, { useEffect, useState } from 'react';
import JnAjax from '@/app/JnAjax';
import { ResumeRowsGrid } from '../ResumeRowsGrid';
import PageTitle from '@/presentation/layouts/page-title';
import { decideSeeAll, getRecipientFromQuery, getSeeAllTitle, prefillTheLoginWithTheRecipient } from './seeAllRecipient';
import { ModalLoginStore } from '@/presentation/auth/ModalLogin';
import { registerTheRecipientAnswers } from './registerTheRecipientAnswers';
import { NotLoggedMessage } from '@/presentation/components/not-logged/NotLoggedMessage';

type Situation = 'loading' | 'loaded' | 'noEmail' | 'notLogged' | 'error' | 'wrongAccount';

const messages: Record<Exclude<Situation, 'loaded' | 'wrongAccount' | 'notLogged'>, string> = {
    loading: 'Carregando os currículos...',
    noEmail: 'Não há e-mail de currículos seu do último dia. A lista completa fica disponível por um dia após cada e-mail.',
    error: 'Não foi possível carregar os currículos agora. Tente de novo em alguns instantes.',
};

/**
 * A tela "Ver todos" do e-mail de currículos: todos os currículos do último e-mail do recrutador logado, na ordem e com
 * os textos do e-mail (que mostra só os 30 primeiros). A lista foi gravada antes do envio e é lida pelo id, o e-mail do
 * recrutador; por isso exige login: quem não está logado vê a faixa com o link que abre o modal de login, já com o e-mail
 * do destinatário (desde 2026-11-23; antes o modal abria sozinho), e a busca é repetida ao entrar.
 * O link do e-mail leva o destinatário (`?email=`): com outra conta logada, a tela avisa, sai dessa conta e abre o login
 * (até 2026-11-12 abria vazia, lendo a lista da conta errada). O grid é paginado no navegador (desde 2026-11-14), com a
 * coluna # numerando a lista inteira, na ordem do e-mail.
 * O checkbox "Mostrar apenas os currículos que ainda não vi" (desde 2026-11-15, desmarcado ao abrir) deixa no grid só os
 * currículos sem visualização do recrutador (o campo viewed da lista, gravado no envio do e-mail: uma visualização feita
 * depois do envio só aparece na lista do próximo e-mail); a coluna # numera as linhas que ficaram. O grid, o checkbox e a
 * paginação ficam no ResumeRowsGrid (desde 2026-11-22), que a lista dos currículos dos filtros da vaga também usa.
 */
export const ResumesOfTheWeek = () => {
    const [situation, setSituation] = useState<Situation>('loading');
    const [resumes, setResumes] = useState<any[]>([]);
    const [email, setEmail] = useState('');
    const [recipient, setRecipient] = useState('');
    const [wrongEmail, setWrongEmail] = useState('');

    // abre o login já com o e-mail do destinatário do link; ao entrar, repete a busca
    const askTheRecipientLogin = (expected: string) => {
        prefillTheLoginWithTheRecipient(expected, ModalLoginStore.getState().setEmail);
        JnAjax.getHandler401(() => load(expected))();
    };

    // sai da conta logada (que não é a do destinatário) e abre o login, que repete a busca ao entrar
    const loginAsTheRecipient = (expected: string, login: any) => {
        setWrongEmail(login.email);
        setSituation('wrongAccount');
        JnAjax.removeLogin();
        JnAjax.clearScreenCache();
        // encerra a sessão no backend, como o "Sair" do header; sem resposta a tratar (um 401 aqui não pode abrir outro login)
        const ignore = () => {};
        const logoutCallbacks: any = { setLoading: ignore, setNotLoading: ignore, 401: ignore, onUnexpectedHttpStatus: ignore };
        JnAjax.doAnAjaxRequest(`login/${login.email}/${login.sessionToken}`, logoutCallbacks, 'DELETE', null as any, {}, 'http://localhost:8082');
        askTheRecipientLogin(expected);
    };

    const load = (expected: string = recipient) => {
        const login: any = JnAjax.getLogin() || {};
        const decision = decideSeeAll(expected, login.email);
        if (decision == 'wrongAccount') {
            loginAsTheRecipient(expected, login);
            return;
        }
        setSituation('loading');
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            setResumes(response.resumes || []);
            setEmail((JnAjax.getLogin() as any).email || '');
            setSituation('loaded');
        };
        callbacks[404] = () => setSituation('noEmail');
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            setSituation('notLogged');
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        // GET sem corpo: com {} o jQuery poria "?{}" na URL
        JnAjax.doACachedRequest('recruiter/{email}/resumes-of-the-week', callbacks, 'GET', null as any, {}, 'http://localhost:8081');
    };

    useEffect(() => {
        const expected = getRecipientFromQuery(window.location.search);
        setRecipient(expected);
        // o destinatário é recrutador: grava as suas respostas do pré-cadastro, se ainda não as tem
        registerTheRecipientAnswers(expected);
        load(expected);
    }, []);

    // o título fica aqui, e não na página, porque o e-mail do recrutador só existe no navegador
    const title = <PageTitle>{getSeeAllTitle(situation == 'loaded' ? email : '', recipient)}</PageTitle>;

    if (situation == 'wrongAccount') {
        return (
            <div>
                {title}
                <div className="panel mt-6">
                    Esta lista de currículos foi enviada para <b>{recipient}</b>, mas você estava logado como <b>{wrongEmail}</b>. Entre com <b>{recipient}</b> para ver a lista.
                </div>
            </div>
        );
    }

    if (situation == 'notLogged') {
        return (
            <div>
                {title}
                <div className="mt-6">
                    <NotLoggedMessage
                        before="Você não está logado!"
                        after="com o e-mail em que você recebe os currículos para ver a lista completa."
                        onLoggedIn={() => load(recipient)}
                        openLogin={() => askTheRecipientLogin(recipient)}
                    />
                </div>
            </div>
        );
    }

    if (situation != 'loaded') {
        return (
            <div>
                {title}
                <div className="panel mt-6">{messages[situation]}</div>
            </div>
        );
    }

    return (
        <div>
            {title}
            <div className="panel mt-6">
                <ResumeRowsGrid
                    resumes={resumes}
                    email={email}
                    checkboxId="resumesOfTheWeekOnlyNotViewed"
                    title={(total, shown, onlyNotViewed) => (
                        <>
                            {total} {total == 1 ? 'currículo inserido ou alterado' : 'currículos inseridos ou alterados'} nos últimos 7 dias
                            {onlyNotViewed && `, ${shown} ${shown == 1 ? 'ainda não visto' : 'ainda não vistos'}`}
                        </>
                    )}
                />
            </div>
        </div>
    );
};
