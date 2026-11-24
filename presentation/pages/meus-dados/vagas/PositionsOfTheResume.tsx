'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import JnAjax from '@/app/JnAjax';
import { NotLoggedMessage } from '@/presentation/components/not-logged/NotLoggedMessage';
import { resumeTypeLabelOf } from '@/presentation/menus/areaLeft/MenuLeftMyData/SubMenuMyResume/ResumePreview';
import { contactHref, contactLabel, newestFirst, PositionOfTheResume, regionsLabel, salaryLabel, senioritiesLabel, validUntilLabel } from './resumePositionsData';

type Situation = 'loading' | 'loaded' | 'notLogged' | 'noResume' | 'inactiveResume' | 'error';

const messages: Record<'loading' | 'error', string> = {
    loading: 'Carregando as vagas compatíveis com o seu currículo...',
    error: 'Não foi possível carregar as vagas agora. Tente de novo em alguns instantes.',
};

/**
 * Meus dados → Minhas vagas (desde 2026-11-24): as vagas em que o recrutador escolheu que os próprios candidatos enviam
 * os seus currículos, ainda válidas, que o currículo do candidato logado atende (área, senioridade, idiomas, habilidades,
 * pretensões, disponibilidade, regiões e empresas proibidas). Cada vaga mostra os contatos para onde enviar o currículo.
 * A lista é lida pelo id do currículo; por isso exige login. Um candidato sem currículo é convidado a cadastrá-lo, e
 * um com o currículo inativo (a API responde 301: o registro está na gêmea), a reativá-lo.
 */
export const PositionsOfTheResume = () => {
    const [situation, setSituation] = useState<Situation>('loading');
    const [positions, setPositions] = useState<PositionOfTheResume[]>([]);

    const load = () => {
        setSituation('loading');
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
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
        JnAjax.doACachedRequest('resume/{email}/positions', callbacks, 'GET', null as any, {}, 'http://localhost:8081');
    };

    useEffect(load, []);

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

    if (situation != 'loaded') return <div className="panel mt-6">{messages[situation]}</div>;

    if (positions.length == 0) return <div className="panel mt-6">Nenhuma vaga aberta aos candidatos combina com o seu currículo agora. Volte em outro momento.</div>;

    return (
        <div className="mt-6 space-y-4">
            <h5 className="text-lg font-semibold">
                {positions.length} {positions.length == 1 ? 'vaga compatível' : 'vagas compatíveis'} com o seu currículo
            </h5>
            {positions.map((position) => (
                <div key={`${position.title}-${position.expiration.min}`} className="panel space-y-2">
                    <h6 className="text-base font-bold">{position.title}</h6>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {[resumeTypeLabelOf(position.resumeType), senioritiesLabel(position.seniority), regionsLabel(position.ddd)].filter(Boolean).join(' · ')}
                    </div>
                    {position.clt && <div className="text-sm">CLT: {salaryLabel(position.clt)}</div>}
                    {position.pj && <div className="text-sm">PJ: {salaryLabel(position.pj)}</div>}
                    <div className="text-sm">Vaga válida até {validUntilLabel(position.expiration.max)}</div>
                    <p className="whitespace-pre-line text-sm">{position.description}</p>
                    {position.contact?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                            <span className="text-sm font-semibold">Envie o seu currículo:</span>
                            {position.contact.map((contact) => (
                                <a key={`${contact.type}-${contact.value}`} href={contactHref(contact)} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                                    {contactLabel(contact)}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
