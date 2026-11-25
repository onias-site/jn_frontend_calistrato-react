'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import JnAjax from '@/app/JnAjax';
import { ConfirmModal } from '@/presentation/components/source/ConfirmModal';
import { notify } from '@/presentation/components/source/notify';
import { NotLoggedMessage } from '@/presentation/components/not-logged/NotLoggedMessage';
import { resumeTypeLabelOf } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/ResumePreview';
import {
    contactHref,
    contactLabel,
    newestFirst,
    PositionOfTheResume,
    regionsLabel,
    salaryLabel,
    senioritiesLabel,
    sendingHourLabel,
    validUntilLabel,
    withoutPosition,
    withSendingHour,
} from './resumePositionsData';

type Situation = 'loading' | 'loaded' | 'notLogged' | 'noResume' | 'inactiveResume' | 'pendingIssues' | 'error';

const messages: Record<'loading' | 'error', string> = {
    loading: 'Carregando as vagas compatíveis com o seu currículo...',
    error: 'Não foi possível carregar as vagas agora. Tente de novo em alguns instantes.',
};

const POSITIONS_URI = 'resume/{email}/positions';

/**
 * Meus dados → Minhas vagas (desde 2026-11-24): as vagas em que o recrutador escolheu que os próprios candidatos enviam
 * os seus currículos, ainda válidas, que o currículo do candidato logado atende (área, senioridade, idiomas, habilidades,
 * pretensões, disponibilidade, regiões e empresas proibidas) e cujo recrutador não negativou o currículo. Cada vaga
 * mostra os contatos do recrutador e o botão "Enviar meu currículo": confirmado, o currículo vai ao recrutador na
 * próxima hora cheia, na lista de currículos da vaga, com os dos outros candidatos interessados. A lista é lida pelo id
 * do currículo; por isso exige login. Um candidato sem currículo é convidado a cadastrá-lo; um com o currículo inativo
 * (a API responde 301), a reativá-lo; um com pendências no currículo (LinkedIn inválido ou restrição), a corrigi-las.
 */
export const PositionsOfTheResume = () => {
    const [situation, setSituation] = useState<Situation>('loading');
    const [positions, setPositions] = useState<PositionOfTheResume[]>([]);
    const [confirming, setConfirming] = useState<PositionOfTheResume | null>(null);

    const load = () => {
        setSituation('loading');
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            if (response.resumeWithPendingIssues) {
                setSituation('pendingIssues');
                return;
            }
            setPositions(newestFirst(response.positions || []));
            setSituation('loaded');
        };
        callbacks[404] = () => setSituation('noResume');
        // o currículo existe, mas está inativo (na gêmea): a leitura por id avisa que ele está do outro lado
        callbacks[301] = () => setSituation('inactiveResume');
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            setSituation('notLogged');
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        // GET sem corpo
        JnAjax.doACachedRequest(POSITIONS_URI, callbacks, 'GET', null as any, {}, 'http://localhost:8081');
    };

    useEffect(load, []);

    // a lista guardada na memória da tela deixa de valer depois do envio
    const forgetTheList = () => JnAjax.clearScreenCache('/positions');

    const sendTheResume = (position: PositionOfTheResume) => () => {
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            forgetTheList();
            setPositions((current) => withSendingHour(current, position.id, response.sendingHour));
            notify({ summary: 'Interesse registrado', detail: `O seu currículo vai para o recrutador às ${sendingHourLabel(response.sendingHour)}.` });
        };
        callbacks[409] = () => {
            forgetTheList();
            notify({ summary: 'Currículo já enviado', detail: 'Você já enviou o seu currículo para esta vaga.', severity: 'warn' });
        };
        callbacks[404] = () => {
            forgetTheList();
            setPositions((current) => withoutPosition(current, position.id));
            notify({ summary: 'Vaga indisponível', detail: 'Esta vaga não está mais aberta ao seu currículo.', severity: 'error' });
        };
        callbacks[410] = () => {
            forgetTheList();
            setPositions((current) => withoutPosition(current, position.id));
            notify({ summary: 'Vaga encerrada', detail: 'A validade desta vaga terminou.', severity: 'error' });
        };
        callbacks[422] = () => {
            forgetTheList();
            setSituation('pendingIssues');
        };
        callbacks[301] = () => {
            forgetTheList();
            setSituation('inactiveResume');
        };
        callbacks[401] = () => {
            JnAjax.setNotLoading()();
            JnAjax.getHandler401(sendTheResume(position))();
        };
        callbacks['onUnexpectedHttpStatus'] = () => notify({ summary: 'Não foi possível enviar', detail: 'Tente de novo em alguns instantes.', severity: 'error' });
        JnAjax.doAnAjaxRequest(`${POSITIONS_URI}/interest`, callbacks, 'POST', { position: position.id }, {}, 'http://localhost:8081');
    };

    if (situation == 'notLogged') {
        return (
            <div className="panel mt-6">
                <NotLoggedMessage before="Você não está logado! Caso tenha cadastrado currículo conosco," after="para ver as vagas compatíveis com o seu currículo." onLoggedIn={load} />
            </div>
        );
    }

    if (situation == 'inactiveResume') {
        return (
            <div className="panel mt-6">
                O seu currículo está inativo.{' '}
                <Link href="/meus-dados/sobre-mim" className="text-primary underline">
                    Reative o seu currículo
                </Link>{' '}
                para ver as vagas compatíveis com ele.
            </div>
        );
    }

    if (situation == 'noResume') {
        return (
            <div className="panel mt-6">
                Você ainda não tem um currículo ativo.{' '}
                <Link href="/meus-dados/sobre-mim" className="text-primary underline">
                    Cadastre o seu currículo
                </Link>{' '}
                para ver as vagas compatíveis com ele.
            </div>
        );
    }

    if (situation == 'pendingIssues') {
        return (
            <div className="panel mt-6">
                O seu currículo tem pendências a corrigir.{' '}
                <Link href="/meus-dados/sobre-mim" className="text-primary underline">
                    Abra o seu currículo
                </Link>{' '}
                e veja o que precisa ser ajustado: enquanto isso, ele não é enviado a nenhuma vaga.
            </div>
        );
    }

    if (situation != 'loaded') return <div className="panel mt-6">{messages[situation]}</div>;

    if (positions.length == 0) return <div className="panel mt-6">Nenhuma vaga aberta aos candidatos combina com o seu currículo agora. Volte em outro momento.</div>;

    return (
        <div className="mt-6 space-y-4">
            <h5 className="text-lg font-semibold">
                {positions.length} {positions.length == 1 ? 'vaga compatível' : 'vagas compatíveis'} com o seu currículo
            </h5>
            {positions.map((position) => (
                <div key={position.id} className="panel space-y-2">
                    <h6 className="text-base font-bold">{position.title}</h6>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {[resumeTypeLabelOf(position.resumeType), senioritiesLabel(position.seniority), regionsLabel(position.ddd)].filter(Boolean).join(' · ')}
                    </div>
                    {position.clt && <div className="text-sm">CLT: {salaryLabel(position.clt)}</div>}
                    {position.pj && <div className="text-sm">PJ: {salaryLabel(position.pj)}</div>}
                    <div className="text-sm">Vaga válida até {validUntilLabel(position.expiration.max)}</div>
                    <p className="whitespace-pre-line text-sm">{position.description}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        {position.resumeSent ? (
                            <span className="text-sm font-semibold text-success">O seu currículo já foi enviado ao recrutador.</span>
                        ) : position.sendingHour ? (
                            <span className="text-sm font-semibold text-primary">O seu currículo vai para o recrutador às {sendingHourLabel(position.sendingHour)}.</span>
                        ) : (
                            <button type="button" className="btn btn-primary btn-sm" onClick={() => setConfirming(position)}>
                                Enviar meu currículo
                            </button>
                        )}
                    </div>
                    {position.contact?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                            <span className="text-sm font-semibold">Contatos do recrutador:</span>
                            {position.contact.map((contact) => (
                                <a key={`${contact.type}-${contact.value}`} href={contactHref(contact)} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                                    {contactLabel(contact)}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            <ConfirmModal
                visible={confirming != null}
                onHide={() => setConfirming(null)}
                header="Enviar meu currículo"
                message={
                    confirming && (
                        <>
                            Confirma o envio do seu currículo para a vaga <b>{confirming.title}</b>? Ele vai para o recrutador na próxima hora cheia, junto com os
                            currículos dos outros candidatos interessados nesta vaga.
                        </>
                    )
                }
                acceptLabel="Enviar"
                rejectLabel="Cancelar"
                accept={() => confirming && sendTheResume(confirming)()}
            />
        </div>
    );
};
