'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@mantine/core';
import JnAjax from '@/app/JnAjax';
import { foundResumesMessage, ResumesOfTheFilters } from './resumesOfTheFilters';

type ResumesOfTheFiltersMessageProps = {
    // o corpo do POST positions/resumes-of-the-filters; null enquanto não dá para contar (sem área ou sem região)
    request: Record<string, any> | null;
};

// espera o usuário parar de mexer nos filtros antes de perguntar ao backend
const DEBOUNCE_MILLISECONDS = 500;

/**
 * A área de mensagens dos filtros do formulário de vagas (desde 2026-11-22): a cada mudança dos filtros (área, regiões,
 * senioridade, habilidades obrigatórias, idiomas, salários e as caixas), espera meio segundo e pergunta ao backend quantos
 * currículos atendem a eles; enquanto ele não responde, mostra um spinner, e com a resposta "Foram encontrados N
 * currículos" com as médias de pretensão. Só a resposta do último pedido vale.
 */
export const ResumesOfTheFiltersMessage = ({ request }: ResumesOfTheFiltersMessageProps) => {
    const [loading, setLoading] = useState(false);
    const [found, setFound] = useState<ResumesOfTheFilters | null>(null);
    const [failed, setFailed] = useState(false);
    // o número do último pedido: uma resposta atrasada de um pedido anterior é descartada
    const lastRequest = useRef(0);
    const requestKey = request ? JSON.stringify(request) : '';

    useEffect(() => {
        if (!request) {
            setFound(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        const timer = setTimeout(() => {
            const requestNumber = ++lastRequest.current;
            const isLast = () => requestNumber == lastRequest.current;
            const callbacks: any = {};
            // o spinner fica na área de mensagens, não na tela inteira
            callbacks['setLoading'] = () => {};
            callbacks['setNotLoading'] = () => {};
            // rota pública: quem ainda não fez login também vê a contagem (o login só é pedido ao salvar a vaga)
            callbacks['withoutSession'] = true;
            callbacks[200] = (response: any) => {
                if (!isLast()) return;
                setFound(response);
                setFailed(false);
                setLoading(false);
            };
            const failure = () => {
                if (!isLast()) return;
                setFailed(true);
                setLoading(false);
            };
            callbacks[422] = failure;
            callbacks['onUnexpectedHttpStatus'] = failure;
            JnAjax.doAnAjaxRequest('positions/resumes-of-the-filters', callbacks, 'POST', request, {}, 'http://localhost:8081');
        }, DEBOUNCE_MILLISECONDS);
        return () => clearTimeout(timer);
    }, [requestKey]);

    if (!request) return null;

    return (
        <div role="status" className="mb-5 flex min-h-[2.75rem] items-center gap-2 rounded-md border border-primary/30 bg-primary-light px-4 py-2.5 text-sm text-primary dark:bg-primary-dark-light">
            {loading ? (
                <>
                    <Loader size="sm" />
                    <span>Procurando os currículos que atendem aos filtros da vaga...</span>
                </>
            ) : failed ? (
                <span className="text-danger">Não foi possível contar os currículos agora. Mude os filtros ou tente de novo em alguns instantes.</span>
            ) : (
                found && <span className="font-semibold">{foundResumesMessage(found)}</span>
            )}
        </div>
    );
};
