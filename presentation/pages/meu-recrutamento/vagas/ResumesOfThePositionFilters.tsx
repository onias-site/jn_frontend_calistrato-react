'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Loader, Tabs } from '@mantine/core';
import JnAjax from '@/app/JnAjax';
import { ResumeRowsGrid } from '../ResumeRowsGrid';
import { SortRule } from './positionsData';
import { sortResumes } from './resumesSort';

type Situation = 'loading' | 'loaded' | 'notLogged' | 'error';

type Tab = 'matching' | 'unwanted';

const messages: Record<Exclude<Situation, 'loaded'>, string> = {
    loading: 'Carregando os currículos que atendem aos filtros da vaga...',
    notLogged: 'Entre com o seu e-mail de recrutador para ver quais são estes currículos.',
    error: 'Não foi possível carregar os currículos agora. Tente de novo em alguns instantes.',
};

const plural = (total: number, singular: string, plural: string) => `${total} ${total == 1 ? singular : plural}`;

/**
 * A aba "Currículos aderentes" do modal da vaga (desde 2026-11-22), aberta pelo link "Ver quais são estes currículos" da
 * contagem: os currículos que atendem aos filtros da vaga, no grid de "curriculos-da-semana", em duas abas como as de
 * "curriculos-visualizados": "Aderentes", com os que o recrutador não marcou como indesejados (vistos por ele ou não; o
 * checkbox deixa só os que ainda não viu), e "Indesejados", com os que ele negativou. O POST
 * recruiter/{email}/resumes-of-the-position-filters recebe os ids que a contagem devolveu e lê esses currículos pelo id
 * (mget), conferindo de novo o que o recrutador da sessão pode ver; exige login. A lista é lida ao abrir a aba e de novo
 * a cada contagem nova (mudou um filtro, mudam os ids). O link de cada currículo abre a prévia numa nova aba do navegador
 * e grava a visualização (ela passa a constar em "curriculos-visualizados").
 */
export const ResumesOfThePositionFilters = ({ ids, sort, desiredSkills }: { ids: string[]; sort: SortRule[]; desiredSkills: string[] }) => {
    const [situation, setSituation] = useState<Situation>('loading');
    const [receivedResumes, setResumes] = useState<any[]>([]);
    const [receivedUnwantedResumes, setUnwantedResumes] = useState<any[]>([]);
    // a ordem da aba Opções (desde 2026-11-24): a lista que já chegou é reordenada aqui, sem pedir de novo ao mudar um critério
    const sortKey = JSON.stringify([sort, desiredSkills]);
    const resumes = useMemo(() => sortResumes(receivedResumes, sort, desiredSkills), [receivedResumes, sortKey]);
    const unwantedResumes = useMemo(() => sortResumes(receivedUnwantedResumes, sort, desiredSkills), [receivedUnwantedResumes, sortKey]);
    const [email, setEmail] = useState('');
    const [tab, setTab] = useState<Tab>('matching');

    const load = () => {
        setSituation('loading');
        const callbacks: any = {};
        // o carregamento fica na aba, não na tela inteira
        callbacks['setLoading'] = () => {};
        callbacks['setNotLoading'] = () => {};
        callbacks[200] = (response: any) => {
            setResumes(response.resumes || []);
            setUnwantedResumes(response.unwantedResumes || []);
            setEmail((JnAjax.getLogin() as any).email || '');
            setSituation('loaded');
        };
        callbacks[401] = () => {
            setSituation('notLogged');
            JnAjax.getHandler401(load)();
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        JnAjax.doAnAjaxRequest('recruiter/{email}/resumes-of-the-position-filters', callbacks, 'POST', { ids }, {}, 'http://localhost:8081');
    };

    const idsKey = ids.join(',');
    // sem ids não há o que ler: o back end recusa a lista vazia
    useEffect(() => {
        ids.length > 0 && load();
    }, [idsKey]);

    if (ids.length == 0) {
        return <div>Nenhum currículo atende aos filtros da vaga agora.</div>;
    }

    // a leitura dos currículos é lenta (desde 2026-11-24): o spinner mostra que a lista está chegando
    if (situation == 'loading') {
        return (
            <div role="status" className="flex items-center gap-3 py-6">
                <Loader size="md" />
                <span>{messages.loading}</span>
            </div>
        );
    }

    if (situation != 'loaded') {
        return <div>{messages[situation]}</div>;
    }

    return (
        <Tabs value={tab} onChange={(value) => setTab((value as Tab) || 'matching')}>
            {/* numa tela estreita as abas rolam na horizontal em vez de quebrar o nome em duas linhas */}
            <Tabs.List className="mb-5 flex-nowrap overflow-x-auto">
                <Tabs.Tab value="matching" className="whitespace-nowrap font-semibold">
                    Aderentes ({resumes.length})
                </Tabs.Tab>
                <Tabs.Tab value="unwanted" className="whitespace-nowrap font-semibold">
                    Indesejados ({unwantedResumes.length})
                </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="matching">
                {resumes.length == 0 ? (
                    <div>Nenhum currículo que atende aos filtros da vaga está fora dos indesejados.</div>
                ) : (
                    <ResumeRowsGrid
                        resumes={resumes}
                        email={email}
                        checkboxId="positionResumesOnlyNotViewed"
                        title={(total, shown, onlyNotViewed) => (
                            <>
                                {plural(total, 'currículo atende', 'currículos atendem')} aos filtros da vaga
                                {onlyNotViewed && `, ${plural(shown, 'ainda não visto', 'ainda não vistos')}`}
                            </>
                        )}
                    />
                )}
            </Tabs.Panel>
            <Tabs.Panel value="unwanted">
                {unwantedResumes.length == 0 ? (
                    <div>Nenhum currículo que atende aos filtros da vaga está entre os seus indesejados.</div>
                ) : (
                    <ResumeRowsGrid
                        resumes={unwantedResumes}
                        email={email}
                        checkboxId="positionUnwantedResumesOnlyNotViewed"
                        title={(total, shown, onlyNotViewed) => (
                            <>
                                {plural(total, 'currículo indesejado atende', 'currículos indesejados atendem')} aos filtros da vaga
                                {onlyNotViewed && `, ${plural(shown, 'ainda não visto', 'ainda não vistos')}`}
                            </>
                        )}
                    />
                )}
            </Tabs.Panel>
        </Tabs>
    );
};
