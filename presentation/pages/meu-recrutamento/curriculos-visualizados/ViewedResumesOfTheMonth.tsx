'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs } from '@mantine/core';
import JnAjax from '@/app/JnAjax';
import { Modal } from '@/presentation/components/source/Modal';
import { ConfirmModal } from '@/presentation/components/source/ConfirmModal';
import { notify } from '@/presentation/components/source/notify';
import { ModalLoginStore } from '@/presentation/auth/ModalLogin';
import { MonthPicker, currentMonth, monthParameter } from '@/presentation/components/month-picker/MonthPicker';
import { ViewedResumeDetails } from './ViewedResumeDetails';
import { EditViewedResumeDetails } from './EditViewedResumeDetails';
import { ViewedResumesGrid } from './ViewedResumesGrid';
import { ViewedResume, editView, moveView, parseViews } from './viewedResumesData';

type Situation = 'loading' | 'loaded' | 'notLogged' | 'error';

type Tab = 'viewed' | 'unwanted';

const messages: Record<Exclude<Situation, 'loaded'>, string> = {
    loading: 'Carregando os currículos visualizados...',
    notLogged: 'Entre com o seu e-mail de recrutador para ver os currículos que você visualizou.',
    error: 'Não foi possível carregar os currículos visualizados agora. Tente de novo em alguns instantes.',
};

// o que cada aba faz com o currículo ao trocá-lo de aba: o caminho da API, o rótulo do link e os textos da confirmação
const moves: Record<Tab, { path: string; label: string; header: string; message: string; done: string; danger: boolean }> = {
    viewed: {
        path: 'unwanted',
        label: 'Negativar CV',
        header: 'Negativar currículo',
        message: 'Ao negativar este currículo, ele não lhe será mais enviado por e-mail e passará para a aba "Indesejados". Deseja continuar?',
        done: 'O currículo foi para a aba "Indesejados" e não lhe será mais enviado por e-mail.',
        danger: true,
    },
    unwanted: {
        path: 'wanted',
        label: 'Positivar CV',
        header: 'Positivar currículo',
        message: 'Ao positivar este currículo, ele volta para a aba "Visualizados" e poderá lhe ser enviado de novo por e-mail. Deseja continuar?',
        done: 'O currículo voltou para a aba "Visualizados" e poderá lhe ser enviado de novo por e-mail.',
        danger: false,
    },
};

/**
 * Os currículos que o recrutador logado visualizou num mês, em duas abas (desde 2026-11-15): "Visualizados", com as
 * visualizações da entidade principal (vis_viewed_resume), e "Indesejados", com as da gêmea (vis_inactive_viewed_resume),
 * como a de um currículo cujo LinkedIn o recrutador reportou como inválido. Um item por currículo, com o apelido, o
 * comentário e a data da última visualização no mês; o LinkedIn fica nos detalhes. O mês é escolhido na tela, vale para as
 * duas abas e começa no mês corrente. As duas listas vêm numa só leitura pelo id do grupo do recrutador no mês (os dois
 * lados do grouper); por isso exige login, e quem não está logado vê o modal de login, que repete a busca ao entrar.
 * Cada linha tem "ver detalhes" (o currículo como a prévia do candidato o mostra), "Editar detalhes" (apelido e
 * comentário, gravados no lado em que a visualização está) e "Negativar CV" / "Positivar CV", que, depois de confirmar,
 * troca o currículo de aba. As gravações são assíncronas no back end: a tela atualiza as listas com o que enviou e
 * descarta a lista guardada em memória, para a próxima leitura ir ao back end.
 */
export const ViewedResumesOfTheMonth = () => {
    const [month, setMonth] = useState(currentMonth());
    const [situation, setSituation] = useState<Situation>('loading');
    const [views, setViews] = useState<ViewedResume[]>([]);
    const [unwantedViews, setUnwantedViews] = useState<ViewedResume[]>([]);
    const [tab, setTab] = useState<Tab>('viewed');
    const [selected, setSelected] = useState<ViewedResume | null>(null);
    const [editing, setEditing] = useState<ViewedResume | null>(null);
    const [moving, setMoving] = useState<ViewedResume | null>(null);
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

    // a lista guardada em memória ficou velha depois de uma gravação: a próxima leitura vai ao back end
    const forgetTheLists = () => JnAjax.clearScreenCache('/viewed-resumes/');

    const saved = (alias: string, comment: string) => {
        const linkedinHash = editing!.linkedinHash;
        setViews(editView(views, linkedinHash, alias, comment));
        setUnwantedViews(editView(unwantedViews, linkedinHash, alias, comment));
        forgetTheLists();
        setEditing(null);
    };

    const move = (view: ViewedResume, fromTab: Tab) => () => {
        const chosenMove = moves[fromTab];
        const callbacks: any = {};
        callbacks[200] = () => {
            const [from, to] = fromTab == 'viewed' ? [views, unwantedViews] : [unwantedViews, views];
            const [remaining, reached] = moveView(from, to, view.linkedinHash);
            setViews(fromTab == 'viewed' ? remaining : reached);
            setUnwantedViews(fromTab == 'viewed' ? reached : remaining);
            forgetTheLists();
            notify({ summary: chosenMove.label, detail: chosenMove.done });
        };
        callbacks[404] = () => notify({ summary: 'Currículo não encontrado', detail: 'Este currículo não está entre os que você visualizou neste mês.', severity: 'error' });
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            JnAjax.getHandler401(move(view, fromTab))();
        };
        callbacks['onUnexpectedHttpStatus'] = () => notify({ summary: 'Não foi possível concluir', detail: 'Tente de novo em alguns instantes.', severity: 'error' });
        JnAjax.doAnAjaxRequest(`recruiter/{email}/viewed-resumes/${monthParameter(month)}/${chosenMove.path}`, callbacks, 'POST', { linkedinHash: view.linkedinHash }, {}, 'http://localhost:8081');
    };

    const grid = (gridTab: Tab, gridViews: ViewedResume[], emptyMessage: string, singularTitle: string, pluralTitle: string) => (
        <ViewedResumesGrid
            key={month}
            views={gridViews}
            emptyMessage={emptyMessage}
            singularTitle={singularTitle}
            pluralTitle={pluralTitle}
            moveLabel={moves[gridTab].label}
            onSelect={setSelected}
            onEdit={setEditing}
            onMove={setMoving}
        />
    );

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
                        {grid('viewed', views, 'Você não visualizou nenhum currículo neste mês.', 'currículo visualizado no mês', 'currículos visualizados no mês')}
                    </Tabs.Panel>
                    <Tabs.Panel value="unwanted">
                        {grid('unwanted', unwantedViews, 'Nenhum currículo visualizado neste mês está entre os indesejados.', 'currículo indesejado no mês', 'currículos indesejados no mês')}
                    </Tabs.Panel>
                </Tabs>
            )}
            <Modal visible={selected != null} setVisible={(visible) => !visible && setSelected(null)} title={selected ? selected.alias : ''} size="90rem">
                {selected && <ViewedResumeDetails month={month} linkedinHash={selected.linkedinHash} />}
            </Modal>
            <Modal visible={editing != null} setVisible={(visible) => !visible && setEditing(null)} title="Editar detalhes" size="lg">
                {editing && <EditViewedResumeDetails key={editing.linkedinHash} month={month} view={editing} onSaved={saved} onCancel={() => setEditing(null)} />}
            </Modal>
            <ConfirmModal
                visible={moving != null}
                onHide={() => setMoving(null)}
                header={moves[tab].header}
                message={moves[tab].message}
                danger={moves[tab].danger}
                accept={moving ? move(moving, tab) : () => {}}
            />
        </div>
    );
};
