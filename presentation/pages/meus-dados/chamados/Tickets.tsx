'use client';
import React, { useEffect, useState } from 'react';
import { Modal } from '@mantine/core';
import JnAjax from '@/app/JnAjax';
import { NotLoggedMessage } from '@/presentation/components/not-logged/NotLoggedMessage';
import { GridPagination, paginate } from '@/presentation/components/source/GridPagination';
import { groupParentId } from '../acessos/accessesReconciliation';
import { TICKET_KINDS, Ticket, abbreviate, ticketsFromGroups } from './ticketsFromGroups';

type Situation = 'choosing' | 'loading' | 'loaded' | 'notLogged' | 'error';

const PARENT_NAME = 'jn_login_email';

const messages: Record<Exclude<Situation, 'loaded' | 'notLogged'>, string> = {
    choosing: 'Escolha o tipo de chamado para ver os seus.',
    loading: 'Carregando os seus chamados...',
    error: 'Não foi possível carregar os seus chamados agora. Tente de novo em alguns instantes.',
};

/**
 * Os chamados do usuário logado de um tipo escolhido no combo (os do Fale Conosco, as associações e dissociações de
 * hierarquia, as sugestões de habilidade e os LinkedIns inválidos reportados pelo recrutador): em análise e encerrados, do mais recente ao mais antigo, com as colunas
 * próprias do tipo. Exige login: quem não está logado vê, já ao entrar na tela, a faixa com o link que abre o modal de login (desde
 * 2026-11-23; antes o modal abria sozinho ao escolher o tipo); depois de entrar, a busca do tipo escolhido é refeita.
 */
export const Tickets = () => {
    const [kindValue, setKindValue] = useState('');
    const [situation, setSituation] = useState<Situation>('choosing');
    // sem login, a faixa aparece já ao entrar na tela (lido depois da montagem: o localStorage não existe no servidor)
    useEffect(() => {
        !JnAjax.hasLogin() && setSituation('notLogged');
    }, []);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [page, setPage] = useState(1);
    // a célula comprida demais para a grade, mostrada inteira no modal
    const [fullCell, setFullCell] = useState<{ title: string; text: string } | null>(null);

    const kind = TICKET_KINDS.find((k) => k.value == kindValue);

    const load = () => {
        if (!kind) return;
        setSituation('loading');
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            setTickets(ticketsFromGroups(response, kind));
            setPage(1);
            setSituation('loaded');
        };
        // nenhum chamado desta entidade ainda (o grupo não existe em nenhum dos lados)
        callbacks[404] = () => {
            setTickets([]);
            setSituation('loaded');
        };
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            setSituation('notLogged');
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        const login: any = JnAjax.getLogin() || {};
        const parentId = login.email ? groupParentId(login.email) : '';
        // GET sem corpo: com {} o jQuery poria "?{}" na URL
        JnAjax.doACachedRequest(`grouper/{email}/${PARENT_NAME}/${kind.childName}/${parentId}/bothSides`, callbacks, 'GET', null as any, {}, 'http://localhost:8082');
    };

    useEffect(load, [kindValue]);

    // depois de entrar: busca o tipo escolhido, ou volta a pedir a escolha
    const loggedIn = () => (kind ? load() : setSituation('choosing'));

    const { first, pageRows } = paginate(tickets, page);

    return (
        <div className="panel mt-6">
            <div className="mb-5 max-w-xs">
                <select className="form-select" value={kindValue} onChange={(e) => setKindValue(e.target.value)}>
                    <option value="" disabled hidden>
                        Tipo de chamado
                    </option>
                    {TICKET_KINDS.map((k) => (
                        <option key={k.value} value={k.value}>
                            {k.label}
                        </option>
                    ))}
                </select>
            </div>
            {situation == 'notLogged' ? (
                <NotLoggedMessage before="Você não está logado!" after="para ver os seus chamados." onLoggedIn={loggedIn} />
            ) : situation != 'loaded' || !kind ? (
                <div>{messages[situation == 'loaded' ? 'choosing' : situation]}</div>
            ) : tickets.length == 0 ? (
                <div>Nenhum chamado deste tipo.</div>
            ) : (
                <>
                    <h5 className="mb-4 text-lg font-semibold">
                        {tickets.length} {tickets.length == 1 ? 'chamado' : 'chamados'}
                    </h5>
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Situação</th>
                                    {kind.columns.map((column) => (
                                        <th key={column.title}>{column.title}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pageRows.map((ticket, pageIndex) => (
                                    <tr key={ticket.date + (first + pageIndex)}>
                                        <td className="whitespace-nowrap">{ticket.date || '—'}</td>
                                        <td className="whitespace-nowrap">{ticket.situation}</td>
                                        {kind.columns.map((column) => {
                                            const fullText = column.value(ticket.json);
                                            const { shown, truncated } = abbreviate(fullText);
                                            return (
                                                <td key={column.title} className="whitespace-pre-line">
                                                    {shown || '—'}
                                                    {truncated && (
                                                        <>
                                                            {' '}
                                                            <button type="button" className="whitespace-nowrap text-primary underline" onClick={() => setFullCell({ title: column.title, text: fullText })}>
                                                                ver tudo
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <GridPagination total={tickets.length} page={page} onChange={setPage} />
                </>
            )}
            {fullCell && (
                <Modal opened title={fullCell.title} size="lg" onClose={() => setFullCell(null)}>
                    <div className="whitespace-pre-line break-words">{fullCell.text}</div>
                </Modal>
            )}
        </div>
    );
};
