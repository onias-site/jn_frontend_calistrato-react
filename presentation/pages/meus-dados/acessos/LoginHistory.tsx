'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import JnAjax from '@/app/JnAjax';
import { ModalLoginStore } from '@/presentation/auth/ModalLogin';
import { GridPagination, paginate } from '@/presentation/components/source/GridPagination';
import { Access, CHILD_NAME, PARENT_NAME, accessesFromGroups, currentSessionIndex, groupParentId } from './accessesReconciliation';

/** A coluna Logout: a data do logout; sem ela, "Sessão atual" para a sessão deste navegador e "Expirou" para as demais. */
const LogoutCell = ({ access, isCurrentSession }: { access: Access; isCurrentSession: boolean }) => {
    if (access.logoutDate) {
        return <>{access.logoutDate}</>;
    }
    if (isCurrentSession) {
        return <span className="font-semibold text-success" title="A sessão aberta neste navegador">Sessão atual</span>;
    }
    return <span className="text-white-dark" title="A sessão expirou sem logout">Expirou</span>;
};

type Situation = 'loading' | 'loaded' | 'notLogged' | 'error';

const messages: Record<Exclude<Situation, 'loaded'>, string> = {
    loading: 'Carregando os seus acessos...',
    notLogged: 'Entre com o seu e-mail para ver os seus acessos.',
    error: 'Não foi possível carregar os seus acessos agora. Tente de novo em alguns instantes.',
};

/**
 * Os acessos do usuário logado: cada login (IP, navegador e data) com a data do logout que lhe corresponde, do mais
 * recente ao mais antigo; um login sem logout é uma sessão que expirou (ou a que está aberta). Lê, numa requisição só, os
 * dois lados do grupo do e-mail no jn_grouper (os logins no ativo, os logouts no inativo) e casa um com o outro aqui. O
 * grupo guarda os 100 últimos de cada lado. Exige login: quem não está logado vê o modal de login, que repete a busca ao entrar;
 * fechar o modal sem entrar leva à tela inicial.
 */
export const LoginHistory = () => {
    const [situation, setSituation] = useState<Situation>('loading');
    const [accesses, setAccesses] = useState<Access[]>([]);
    const [page, setPage] = useState(1);
    const router = useRouter();

    const load = () => {
        setSituation('loading');
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            setAccesses(accessesFromGroups(response));
            setPage(1);
            setSituation('loaded');
        };
        // nenhum login gravado ainda (o grupo não existe em nenhum dos lados)
        callbacks[404] = () => {
            setAccesses([]);
            setSituation('loaded');
        };
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            setSituation('notLogged');
            // fechar o modal sem entrar leva à tela inicial: aqui ficaria só uma tela vazia
            ModalLoginStore.getState().setDismissAction(() => router.push('/'));
            JnAjax.getHandler401(load)();
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        const login: any = JnAjax.getLogin() || {};
        const parentId = login.email ? groupParentId(login.email) : '';
        // GET sem corpo: com {} o jQuery poria "?{}" na URL
        JnAjax.doACachedRequest(`grouper/{email}/${PARENT_NAME}/${CHILD_NAME}/${parentId}/bothSides`, callbacks, 'GET', null as any, {}, 'http://localhost:8082');
    };

    useEffect(load, []);

    // na pré-renderização do Next não há navigator (e a tabela ainda não aparece)
    const browserUserAgent = typeof navigator == 'undefined' ? '' : navigator.userAgent;
    const currentSession = currentSessionIndex(accesses, browserUserAgent);
    const { first, pageRows } = paginate(accesses, page);

    return (
        <div className="panel mt-6">
            {situation != 'loaded' ? (
                <div>{messages[situation]}</div>
            ) : accesses.length == 0 ? (
                <div>Nenhum acesso registrado ainda.</div>
            ) : (
                <>
                    <h5 className="mb-4 text-lg font-semibold">
                        {accesses.length} {accesses.length == 1 ? 'acesso' : 'acessos'}
                    </h5>
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>IP</th>
                                    <th>Navegador</th>
                                    <th>Login</th>
                                    <th>Logout</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageRows.map((access, pageIndex) => {
                                    // o índice na lista inteira, que é o que currentSessionIndex devolve
                                    const index = first + pageIndex;
                                    return (
                                        <tr key={access.loginDate + access.ip + access.userAgent + index}>
                                            <td>{access.ip}</td>
                                            <td>{access.userAgent}</td>
                                            <td>{access.loginDate}</td>
                                            <td>
                                                <LogoutCell access={access} isCurrentSession={index == currentSession} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <GridPagination total={accesses.length} page={page} onChange={setPage} />
                </>
            )}
        </div>
    );
};
