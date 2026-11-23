'use client';
import React, { useEffect, useState } from 'react';
import { Checkbox, Tabs } from '@mantine/core';
import JnAjax from '@/app/JnAjax';
import { Modal } from '@/presentation/components/source/Modal';
import { ConfirmModal } from '@/presentation/components/source/ConfirmModal';
import { notify } from '@/presentation/components/source/notify';
import { NotLoggedMessage } from '@/presentation/components/not-logged/NotLoggedMessage';
import { MonthPicker, currentMonth, monthParameter } from '@/presentation/components/month-picker/MonthPicker';
import { ViewedResumeDetails } from './ViewedResumeDetails';
import { EditViewedResumeDetails } from './EditViewedResumeDetails';
import { ViewedResumesGrid } from './ViewedResumesGrid';
import { ViewedResume, editView, moveView, parseViews } from './viewedResumesData';

type Situation = 'loading' | 'loaded' | 'notLogged' | 'error';

type Tab = 'viewed' | 'unwanted';

// o mês da API que lista todas as visualizações do recrutador, de qualquer mês ("Listar todos")
const ALL_MONTHS = 'all';

// as linhas de cada página do grid quando "Listar todos" está marcado
const ALL_MONTHS_PAGE_SIZE = 50;

const messages: Record<Exclude<Situation, 'loaded' | 'notLogged'>, string> = {
    loading: 'Carregando os currículos visualizados...',
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
 * lados do grouper); por isso exige login: quem não está logado vê a faixa com o link que abre o modal de login (desde
 * 2026-11-23; antes o modal abria sozinho), e a busca é repetida ao entrar.
 * Cada linha tem "ver detalhes" (o currículo como a prévia do candidato o mostra), "Editar detalhes" (apelido e
 * comentário, gravados no lado em que a visualização está) e "Negativar CV" / "Positivar CV", que, depois de confirmar,
 * troca o currículo de aba. As gravações são assíncronas no back end: a tela atualiza as listas com o que enviou e
 * descarta a lista guardada em memória, para a próxima leitura ir ao back end.
 * Ao lado do mês/ano, o checkbox "Listar todos" (desde 2026-11-15, desmarcado ao abrir): marcado, o seletor de mês some e
 * as duas abas mostram todas as visualizações do recrutador, de qualquer mês (o grupo do recrutador no jn_grouper, sem
 * mês), em páginas de 50; a negativação vale para sempre, então os indesejados de meses passados aparecem nele.
 */
export const ViewedResumesOfTheMonth = () => {
    const [month, setMonth] = useState(currentMonth());
    const [listAll, setListAll] = useState(false);
    const [situation, setSituation] = useState<Situation>('loading');
    const [views, setViews] = useState<ViewedResume[]>([]);
    const [unwantedViews, setUnwantedViews] = useState<ViewedResume[]>([]);
    const [tab, setTab] = useState<Tab>('viewed');
    const [selected, setSelected] = useState<ViewedResume | null>(null);
    const [editing, setEditing] = useState<ViewedResume | null>(null);
    const [moving, setMoving] = useState<ViewedResume | null>(null);

    // o mês que vai para a API: o escolhido (yyyyMM) ou "all", com "Listar todos" marcado
    const period = listAll ? ALL_MONTHS : monthParameter(month);

    const load = (chosenPeriod: string) => () => {
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
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        // GET sem corpo: com {} o jQuery poria "?{}" na URL
        JnAjax.doACachedRequest(`recruiter/{email}/viewed-resumes/${chosenPeriod}`, callbacks, 'GET', null as any, {}, 'http://localhost:8081');
    };

    useEffect(load(period), [period]);

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
        const notFound = listAll ? 'Este currículo não está entre os que você visualizou.' : 'Este currículo não está entre os que você visualizou neste mês.';
        callbacks[404] = () => notify({ summary: 'Currículo não encontrado', detail: notFound, severity: 'error' });
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            JnAjax.getHandler401(move(view, fromTab))();
        };
        callbacks['onUnexpectedHttpStatus'] = () => notify({ summary: 'Não foi possível concluir', detail: 'Tente de novo em alguns instantes.', severity: 'error' });
        JnAjax.doAnAjaxRequest(`recruiter/{email}/viewed-resumes/${period}/${chosenMove.path}`, callbacks, 'POST', { linkedinHash: view.linkedinHash }, {}, 'http://localhost:8081');
    };

    const listAllCheckbox = <Checkbox id="viewedResumesListAll" label="Listar todos" checked={listAll} onChange={(event) => setListAll(event.currentTarget.checked)} />;

    const grid = (gridTab: Tab, gridViews: ViewedResume[], emptyMessage: string, singularTitle: string, pluralTitle: string) => (
        <ViewedResumesGrid
            key={period}
            views={gridViews}
            emptyMessage={emptyMessage}
            singularTitle={singularTitle}
            pluralTitle={pluralTitle}
            moveLabel={moves[gridTab].label}
            pageSize={listAll ? ALL_MONTHS_PAGE_SIZE : undefined}
            onSelect={setSelected}
            onEdit={setEditing}
            onMove={setMoving}
        />
    );

    return (
        <div className="panel mt-6">
            {/* marcado, o seletor de mês some e fica só o checkbox, na mesma linha e com o mesmo espaçamento */}
            {listAll ? (
                <div className="mb-4 flex flex-wrap items-center gap-3">{listAllCheckbox}</div>
            ) : (
                <MonthPicker id="viewedResumesMonth" month={month} onChange={setMonth}>
                    {listAllCheckbox}
                </MonthPicker>
            )}
            {situation == 'notLogged' ? (
                <NotLoggedMessage before="Você não está logado!" after="com o seu e-mail de recrutador para ver os currículos que você visualizou." onLoggedIn={load(period)} />
            ) : situation != 'loaded' ? (
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
                        {listAll
                            ? grid('viewed', views, 'Você não visualizou nenhum currículo.', 'currículo visualizado', 'currículos visualizados')
                            : grid('viewed', views, 'Você não visualizou nenhum currículo neste mês.', 'currículo visualizado no mês', 'currículos visualizados no mês')}
                    </Tabs.Panel>
                    <Tabs.Panel value="unwanted">
                        {listAll
                            ? grid('unwanted', unwantedViews, 'Nenhum currículo visualizado está entre os indesejados.', 'currículo indesejado', 'currículos indesejados')
                            : grid('unwanted', unwantedViews, 'Nenhum currículo visualizado neste mês está entre os indesejados.', 'currículo indesejado no mês', 'currículos indesejados no mês')}
                    </Tabs.Panel>
                </Tabs>
            )}
            <Modal visible={selected != null} setVisible={(visible) => !visible && setSelected(null)} title={selected ? selected.alias : ''} size="90rem">
                {selected && <ViewedResumeDetails period={period} linkedinHash={selected.linkedinHash} />}
            </Modal>
            <Modal visible={editing != null} setVisible={(visible) => !visible && setEditing(null)} title="Editar detalhes" size="lg">
                {editing && <EditViewedResumeDetails key={editing.linkedinHash} period={period} view={editing} onSaved={saved} onCancel={() => setEditing(null)} />}
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
