'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs } from '@mantine/core';
import JnAjax from '@/app/JnAjax';
import { Modal } from '@/presentation/components/source/Modal';
import { ModalLoginStore } from '@/presentation/auth/ModalLogin';
import { MonthPicker, currentMonth, monthParameter } from '@/presentation/components/month-picker/MonthPicker';
import { ViewedResumeDetails } from './ViewedResumeDetails';
import { ViewedResumesGrid } from './ViewedResumesGrid';
import { ViewedResume, parseViews } from './viewedResumesData';

type Situation = 'loading' | 'loaded' | 'notLogged' | 'error';

type Tab = 'viewed' | 'unwanted';

const messages: Record<Exclude<Situation, 'loaded'>, string> = {
    loading: 'Carregando os currículos visualizados...',
    notLogged: 'Entre com o seu e-mail de recrutador para ver os currículos que você visualizou.',
    error: 'Não foi possível carregar os currículos visualizados agora. Tente de novo em alguns instantes.',
};

/**
 * Os currículos que o recrutador logado visualizou num mês, em duas abas (desde 2026-11-15): "Visualizados", com as
 * visualizações da entidade principal (vis_viewed_resume), e "Indesejados", com as da gêmea (vis_inactive_viewed_resume),
 * como a de um currículo cujo LinkedIn o recrutador reportou como inválido. Um item por currículo, com o apelido e a data
 * da última visualização no mês; o LinkedIn fica nos detalhes. O mês é escolhido na tela, vale para as duas abas e começa
 * no mês corrente (até 2026-11-11, no anterior). As duas listas vêm numa só leitura pelo id do grupo do recrutador no mês
 * (os dois lados do grouper); por isso exige login, e quem não está logado vê o modal de login, que repete a busca ao
 * entrar. "ver detalhes" abre um modal com o currículo como a prévia do currículo do candidato o mostra, sem as empresas
 * que não recebem o LinkedIn. Cada grid é paginado no navegador, e a troca de mês volta à primeira página.
 */
export const ViewedResumesOfTheMonth = () => {
    const [month, setMonth] = useState(currentMonth());
    const [situation, setSituation] = useState<Situation>('loading');
    const [views, setViews] = useState<ViewedResume[]>([]);
    const [unwantedViews, setUnwantedViews] = useState<ViewedResume[]>([]);
    const [tab, setTab] = useState<Tab>('viewed');
    const [selected, setSelected] = useState<ViewedResume | null>(null);
    const router = useRouter();

    const load = (chosenMonth: string) => () => {
        setSituation('loading');
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            setViews(parseViews(response.viewedResume));
            setUnwantedViews(parseViews(response.unwantedResume));
            setSelected(null);
            setSituation('loaded');
        };
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            setSituation('notLogged');
            // fechar o modal sem entrar leva à tela inicial: aqui ficaria só uma tela vazia
            ModalLoginStore.getState().setDismissAction(() => router.push('/'));
            JnAjax.getHandler401(load(chosenMonth))();
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        // GET sem corpo: com {} o jQuery poria "?{}" na URL
        JnAjax.doACachedRequest(`recruiter/{email}/viewed-resumes/${monthParameter(chosenMonth)}`, callbacks, 'GET', null as any, {}, 'http://localhost:8081');
    };

    useEffect(load(month), [month]);

    return (
        <div className="panel mt-6">
            <MonthPicker id="viewedResumesMonth" month={month} onChange={setMonth} />
            {situation != 'loaded' ? (
                <div>{messages[situation]}</div>
            ) : (
                <Tabs value={tab} onChange={(value) => setTab((value as Tab) || 'viewed')}>
                    {/* numa tela estreita as abas rolam na horizontal em vez de quebrar o nome em duas linhas */}
                    <Tabs.List className="mb-5 flex-nowrap overflow-x-auto">
                        <Tabs.Tab value="viewed" className="whitespace-nowrap font-semibold">
                            Visualizados ({views.length})
                        </Tabs.Tab>
                        <Tabs.Tab value="unwanted" className="whitespace-nowrap font-semibold">
                            Indesejados ({unwantedViews.length})
                        </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="viewed">
                        <ViewedResumesGrid
                            views={views}
                            emptyMessage="Você não visualizou nenhum currículo neste mês."
                            singularTitle="currículo visualizado no mês"
                            pluralTitle="currículos visualizados no mês"
                            onSelect={setSelected}
                        />
                    </Tabs.Panel>
                    <Tabs.Panel value="unwanted">
                        <ViewedResumesGrid
                            views={unwantedViews}
                            emptyMessage="Nenhum currículo visualizado neste mês está entre os indesejados."
                            singularTitle="currículo indesejado no mês"
                            pluralTitle="currículos indesejados no mês"
                            onSelect={setSelected}
                        />
                    </Tabs.Panel>
                </Tabs>
            )}
            <Modal visible={selected != null} setVisible={(visible) => !visible && setSelected(null)} title={selected ? selected.alias : ''} size="90rem">
                {selected && <ViewedResumeDetails month={month} linkedinHash={selected.linkedinHash} />}
            </Modal>
        </div>
    );
};
