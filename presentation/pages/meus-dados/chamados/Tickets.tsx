'use client';
import React, { useEffect, useState } from 'react';
// o modal de login (aberto pelo 401) é um Dialog do PrimeReact: sem o tema ele fica transparente sobre a tela
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import JnAjax from '@/app/JnAjax';
import { groupParentId } from '../acessos/accessesReconciliation';
import { TICKET_KINDS, Ticket, ticketsFromGroups } from './ticketsFromGroups';

type Situation = 'choosing' | 'loading' | 'loaded' | 'notLogged' | 'error';

const PARENT_NAME = 'jn_login_email';

const messages: Record<Exclude<Situation, 'loaded'>, string> = {
    choosing: 'Escolha o tipo de chamado para ver os seus.',
    loading: 'Carregando os seus chamados...',
    notLogged: 'Entre com o seu e-mail para ver os seus chamados.',
    error: 'Não foi possível carregar os seus chamados agora. Tente de novo em alguns instantes.',
};

/**
 * Os chamados do usuário logado de um tipo escolhido no combo (os do Fale Conosco, as associações e dissociações de
 * hierarquia e as sugestões de habilidade): em análise e encerrados, do mais recente ao mais antigo, com as colunas
 * próprias do tipo. Exige login: quem não está logado vê o modal de login, que repete a busca.
 */
export const Tickets = () => {
    const [kindValue, setKindValue] = useState('');
    const [situation, setSituation] = useState<Situation>('choosing');
    const [tickets, setTickets] = useState<Ticket[]>([]);

    const kind = TICKET_KINDS.find((k) => k.value == kindValue);

    const load = () => {
        if (!kind) return;
        setSituation('loading');
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            setTickets(ticketsFromGroups(response, kind));
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
            JnAjax.getHandler401(load)();
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        const login: any = JnAjax.getLogin() || {};
        const parentId = login.email ? groupParentId(login.email) : '';
        // GET sem corpo: com {} o jQuery poria "?{}" na URL
        JnAjax.doACachedRequest(`grouper/{email}/${PARENT_NAME}/${kind.childName}/${parentId}/bothSides`, callbacks, 'GET', null as any, {}, 'http://localhost:8082');
    };

    useEffect(load, [kindValue]);

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
            {situation != 'loaded' || !kind ? (
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
                                {tickets.map((ticket, index) => (
                                    <tr key={ticket.date + index}>
                                        <td className="whitespace-nowrap">{ticket.date || '—'}</td>
                                        <td className="whitespace-nowrap">{ticket.situation}</td>
                                        {kind.columns.map((column) => (
                                            <td key={column.title} className="whitespace-pre-line">
                                                {column.value(ticket.json) || '—'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};
