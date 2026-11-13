'use client';
import React, { useEffect, useState } from 'react';
import JnAjax from '@/app/JnAjax';
import { ResumeRowCells, ResumeRowHeaders } from '../ResumeRowCells';
import PageTitle from '@/presentation/layouts/page-title';
import { decideSeeAll, getRecipientFromQuery, getSeeAllTitle } from './seeAllRecipient';

type Situation = 'loading' | 'loaded' | 'noEmail' | 'notLogged' | 'error' | 'wrongAccount';

const messages: Record<Exclude<Situation, 'loaded' | 'wrongAccount'>, string> = {
    loading: 'Carregando os currículos...',
    noEmail: 'Não há e-mail de currículos seu do último dia. A lista completa fica disponível por um dia após cada e-mail.',
    notLogged: 'Entre com o e-mail em que você recebe os currículos para ver a lista completa.',
    error: 'Não foi possível carregar os currículos agora. Tente de novo em alguns instantes.',
};

/**
 * A tela "Ver todos" do e-mail de currículos: todos os currículos do último e-mail do recrutador logado, na ordem e com
 * os textos do e-mail (que mostra só os 30 primeiros). A lista foi gravada antes do envio e é lida pelo id, o e-mail do
 * recrutador; por isso exige login, e quem não está logado vê o modal de login, que repete a busca ao entrar.
 * O link do e-mail leva o destinatário (`?email=`): com outra conta logada, a tela avisa, sai dessa conta e abre o login
 * (até 2026-11-12 abria vazia, lendo a lista da conta errada).
 */
export const ResumesOfTheWeek = () => {
    const [situation, setSituation] = useState<Situation>('loading');
    const [resumes, setResumes] = useState<any[]>([]);
    const [email, setEmail] = useState('');
    const [recipient, setRecipient] = useState('');
    const [wrongEmail, setWrongEmail] = useState('');

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
        JnAjax.getHandler401(() => load(expected))();
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
            JnAjax.getHandler401(() => load(expected))();
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        // GET sem corpo: com {} o jQuery poria "?{}" na URL
        JnAjax.doACachedRequest('recruiter/{email}/resumes-of-the-week', callbacks, 'GET', null as any, {}, 'http://localhost:8081');
    };

    useEffect(() => {
        const expected = getRecipientFromQuery(window.location.search);
        setRecipient(expected);
        load(expected);
    }, []);

    const viewLink = (resume: any) => `/recrutador/ver-curriculo?email=${encodeURIComponent(email)}&resume=${encodeURIComponent(resume.resumeId)}&token=${encodeURIComponent(resume.token)}`;

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
                <h5 className="mb-4 text-lg font-semibold">
                    {resumes.length} {resumes.length == 1 ? 'currículo inserido ou alterado' : 'currículos inseridos ou alterados'} nos últimos 7 dias
                </h5>
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th className="text-center">#</th>
                                <ResumeRowHeaders />
                                <th>Datas e visualização</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resumes.map((resume, index) => (
                                <tr key={resume.resumeId}>
                                    <td className="text-center align-top">{index + 1}</td>
                                    <ResumeRowCells resume={resume} />
                                    <td className="align-top">
                                        <div className={resume.viewed ? '' : 'font-semibold text-danger'}>{resume.lastView}</div>
                                        <a href={viewLink(resume)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            {resume.viewLabel}
                                        </a>
                                        <div>{resume.insertion}</div>
                                        <div>{resume.lastChange}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
