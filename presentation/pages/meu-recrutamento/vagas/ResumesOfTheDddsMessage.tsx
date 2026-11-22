'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@mantine/core';
import JnAjax from '@/app/JnAjax';
import { cacheAllDdds, cacheResumesOf, cachedAllDdds, countResumes, foundResumesMessage, missingDdds } from './resumesOfTheDdds';

type ResumesOfTheDddsMessageProps = {
    // os ddds escolhidos na aba Opções
    ddds: string[];
    // vaga somente home office: a região não importa, contam os currículos de todos os ddds
    homeOffice: boolean;
};

// o pedido de todos os ddds de uma vez (vaga home office), entre os pedidos em andamento
const ALL_DDDS = 'all';

/**
 * A área de mensagens da aba "Opções" do formulário de vagas (desde 2026-11-22): a cada mudança das regiões, pede ao
 * backend só os ddds que o navegador ainda não guardou (na vaga home office, todos os ddds de uma vez, pelo endpoint sem
 * ddds) e, enquanto ele não responde, mostra um spinner; com a resposta, "Foram encontrados N currículos", contando uma
 * vez o currículo que está em vários ddds.
 */
export const ResumesOfTheDddsMessage = ({ ddds, homeOffice }: ResumesOfTheDddsMessageProps) => {
    const [pendingRequests, setPendingRequests] = useState(0);
    const [resumes, setResumes] = useState<number | null>(null);
    const [failed, setFailed] = useState(false);
    // os ddds já pedidos e ainda sem resposta: uma nova mudança das regiões não os pede de novo
    const inFlight = useRef(new Set<string>());
    // a contagem que chega depois de uma resposta vale para as regiões escolhidas agora, não para as de quando pediu
    const current = useRef({ ddds, homeOffice });
    current.current = { ddds, homeOffice };
    const searchKey = homeOffice ? ALL_DDDS : ddds.join(',');

    const countNow = () => {
        const { ddds: currentDdds, homeOffice: currentHomeOffice } = current.current;
        const counted = currentHomeOffice ? cachedAllDdds() || [] : currentDdds;
        return countResumes(counted);
    };

    // missing vazio: todos os ddds (vaga home office)
    const request = (missing: string[]) => {
        const asked = missing.length ? missing : [ALL_DDDS];
        asked.forEach((ddd) => inFlight.current.add(ddd));
        setPendingRequests((pending) => pending + 1);
        const finish = () => {
            asked.forEach((ddd) => inFlight.current.delete(ddd));
            setPendingRequests((pending) => pending - 1);
        };
        const callbacks: any = {};
        // o spinner fica na área de mensagens, não na tela inteira
        callbacks['setLoading'] = () => {};
        callbacks['setNotLoading'] = () => {};
        // rota pública: quem ainda não fez login também vê a contagem (o login só é pedido ao salvar a vaga)
        callbacks['withoutSession'] = true;
        callbacks[200] = (response: any) => {
            const resumesByDdd = (response && response.resumes) || {};
            missing.length ? missing.forEach((ddd) => cacheResumesOf(ddd, resumesByDdd[ddd] || [])) : cacheAllDdds(resumesByDdd);
            finish();
            setFailed(false);
            setResumes(countNow());
        };
        const failure = () => {
            finish();
            setFailed(true);
        };
        callbacks[422] = failure;
        callbacks['onUnexpectedHttpStatus'] = failure;
        const uri = missing.length ? `positions/resumes-of-the-ddds/${missing.join(',')}` : 'positions/resumes-of-the-ddds';
        JnAjax.doAnAjaxRequest(uri, callbacks, 'GET', null as any, {}, 'http://localhost:8081');
    };

    useEffect(() => {
        if (homeOffice) {
            if (cachedAllDdds()) {
                setResumes(countNow());
                return;
            }
            !inFlight.current.has(ALL_DDDS) && request([]);
            return;
        }
        if (!ddds.length) {
            setResumes(null);
            return;
        }
        const missing = missingDdds(ddds).filter((ddd) => !inFlight.current.has(ddd));
        if (!missing.length) {
            setResumes(countNow());
            return;
        }
        request(missing);
    }, [searchKey]);

    if (!homeOffice && !ddds.length) return null;

    return (
        <div role="status" className="mb-5 flex min-h-[2.75rem] items-center gap-2 rounded-md border border-primary/30 bg-primary-light px-4 py-2.5 text-sm text-primary dark:bg-primary-dark-light">
            {pendingRequests > 0 ? (
                <>
                    <Loader size="sm" />
                    <span>{homeOffice ? 'Procurando currículos de todas as regiões...' : 'Procurando currículos nas regiões escolhidas...'}</span>
                </>
            ) : failed ? (
                <span className="text-danger">Não foi possível contar os currículos agora. Mude as regiões ou tente de novo em alguns instantes.</span>
            ) : (
                resumes != null && <span className="font-semibold">{foundResumesMessage(resumes)}</span>
            )}
        </div>
    );
};
