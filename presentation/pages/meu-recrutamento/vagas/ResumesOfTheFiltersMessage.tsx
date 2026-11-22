'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@mantine/core';
import JnAjax from '@/app/JnAjax';
import { foundResumesMessage, ResumesOfTheFilters } from './resumesOfTheFilters';

// espera o usuário parar de mexer nos filtros antes de perguntar ao backend
const DEBOUNCE_MILLISECONDS = 500;

export type ResumesOfTheFiltersState = { loading: boolean; found: ResumesOfTheFilters | null; failed: boolean };

/**
 * A contagem dos currículos que atendem aos filtros da vaga (desde 2026-11-22), uma só para o modal inteiro: a cada
 * filtro preenchido ou mudado, em qualquer aba (área, regiões, senioridade, habilidades obrigatórias, idiomas, salários
 * e as caixas), espera meio segundo e pergunta ao POST positions/resumes-of-the-filters. Fica no modal, e não em cada
 * aba, porque o Tabs só monta a aba aberta: trocar de aba não repete o pedido nem apaga o número. Só a resposta do
 * último pedido vale.
 */
export const useResumesOfTheFilters = (request: Record<string, any> | null): ResumesOfTheFiltersState => {
    const [loading, setLoading] = useState(false);
    const [found, setFound] = useState<ResumesOfTheFilters | null>(null);
    const [failed, setFailed] = useState(false);
    // o número do último pedido: uma resposta atrasada de um pedido anterior é descartada
    const lastRequest = useRef(0);
    const requestKey = request ? JSON.stringify(request) : '';

    useEffect(() => {
        if (!request) {
            lastRequest.current++;
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

    return { loading, found, failed };
};

type ResumesOfTheFiltersMessageProps = ResumesOfTheFiltersState & {
    // o corpo do pedido; null enquanto não dá para contar (sem área ou sem região): a mensagem some
    request: Record<string, any> | null;
    // o link "Ver quais são estes currículos" (desde 2026-11-22): abre a aba dos currículos aderentes, pedindo o login antes
    onSeeTheResumes: () => void;
};

/**
 * A área de mensagens de cada aba com filtros: spinner enquanto o backend não responde, depois a contagem e as médias e,
 * quando há currículos, o link que os lista.
 */
export const ResumesOfTheFiltersMessage = ({ request, loading, found, failed, onSeeTheResumes }: ResumesOfTheFiltersMessageProps) => {
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
                found && (
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-semibold">{foundResumesMessage(found)}</span>
                        {found.resumes > 0 && (
                            <span>
                                <button type="button" className="text-primary underline hover:no-underline" onClick={onSeeTheResumes}>
                                    Ver quais são estes currículos
                                </button>{' '}
                                ou preencha / altere filtros para uma listagem mais assertiva à sua necessidade
                            </span>
                        )}
                    </span>
                )
            )}
        </div>
    );
};
