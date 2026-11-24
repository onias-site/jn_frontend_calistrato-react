'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Tabs } from '@mantine/core';
import JnAjax from '@/app/JnAjax';
import { Modal } from '@/presentation/components/source/Modal';
import { ConfirmModal } from '@/presentation/components/source/ConfirmModal';
import { notify } from '@/presentation/components/source/notify';
import { ModalLoginStore } from '@/presentation/auth/ModalLogin';
import { groupParentId } from '@/presentation/pages/meus-dados/acessos/accessesReconciliation';
import { PositionFormModal } from './PositionFormModal';
import { ReactivatePositionForm } from './ReactivatePositionForm';
import { PositionsGrid, PositionsTab } from './PositionsGrid';
import { Position, changeExpiration, parsePositions, removePosition, replacePosition, splitByExpiration } from './positionsData';

type Situation = 'loading' | 'loaded' | 'notLogged' | 'error';

// o grupo das vagas do usuário no jn_grouper: o e-mail dele (jn_login_email) e a entidade das vagas (vis_position)
const PARENT_NAME = 'jn_login_email';
const CHILD_NAME = 'vis_position';

const messages: Record<Exclude<Situation, 'loaded' | 'notLogged'>, string> = {
    loading: 'Carregando as suas vagas...',
    error: 'Não foi possível carregar as suas vagas agora. Tente de novo em alguns instantes.',
};

// as ações que pedem confirmação: o caminho da API e os textos
type Confirmation = { kind: 'delete' | 'inactivate'; position: Position };

const confirmations = {
    delete: {
        path: 'delete',
        header: 'Excluir vaga',
        message: 'A vaga será excluída e sairá das duas abas. Deseja continuar?',
        done: 'A vaga foi excluída.',
        danger: true,
    },
    inactivate: {
        path: 'inactivate',
        header: 'Inativar vaga',
        message: 'A vaga expira agora e passa para a aba "Vagas expiradas"; depois ela pode ser reativada. Deseja continuar?',
        done: 'A vaga foi para a aba "Vagas expiradas".',
        danger: false,
    },
};

/**
 * A tela "Meu Recrutamento → Vagas" (desde 2026-11-21): as vagas que o usuário logado cadastrou, em duas abas, as dentro
 * da data de expiração e as expiradas, lidas por id no grupo do e-mail dele (jn_grouper). "Abrir nova vaga" e "Editar" abrem
 * o mesmo modal (na edição o título fica travado, por ser parte da chave); "Excluir" (só nas vagas dentro da expiração)
 * manda a vaga para a gêmea, e ela some das duas abas; "Inativar" põe o fim da vaga um minuto antes de agora, e ela vai
 * para a aba das expiradas; "Reativar" pede o novo fim da vaga, e ela volta. As gravações são assíncronas no backend: a
 * tela atualiza a lista com o que enviou, e a lista guardada em memória é descartada (JnAjax.TICKET_WRITES).
 */
export const Positions = () => {
    const [situation, setSituation] = useState<Situation>('loading');
    const [positions, setPositions] = useState<Position[]>([]);
    const [tab, setTab] = useState<PositionsTab>('active');
    // undefined: modal fechado; null: "Abrir nova vaga"; uma vaga: "Editar"
    const [editing, setEditing] = useState<Position | null | undefined>(undefined);
    // "Abrir nova vaga" (desde 2026-11-24) abre a escolha entre a vaga completa e a simplificada
    const [choosing, setChoosing] = useState(false);
    const [simplified, setSimplified] = useState(false);
    const [reactivating, setReactivating] = useState<Position | null>(null);
    const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
    // as vagas gravadas antes de a lista chegar do backend (ex.: a primeira, salva por quem fez o login só para salvar):
    // a gravação é assíncrona e o grupo lido logo depois ainda pode vir sem elas
    const savedBeforeTheList = useRef<Position[]>([]);

    const withTheSaved = (loaded: Position[]) => savedBeforeTheList.current.reduce(replacePosition, loaded);

    const load = () => {
        setSituation('loading');
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            setPositions(withTheSaved(parsePositions(response)));
            setSituation('loaded');
        };
        // nenhuma vaga ainda: o grupo do usuário não existe
        callbacks[404] = () => {
            setPositions(withTheSaved([]));
            setSituation('loaded');
        };
        // a tela abre sem login (desde 2026-11-22): mostra o convite ao login e deixa "Abrir nova vaga" livre; o login só é
        // exigido ao salvar a vaga
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            setSituation('notLogged');
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        const login: any = JnAjax.getLogin() || {};
        const parentId = login.email ? groupParentId(login.email) : '';
        // GET sem corpo: com {} o jQuery poria "?{}" na URL
        JnAjax.doACachedRequest(`grouper/{email}/${PARENT_NAME}/${CHILD_NAME}/${parentId}`, callbacks, 'GET', null as any, {}, 'http://localhost:8082');
    };

    useEffect(load, []);

    const openComplete = () => {
        setChoosing(false);
        setSimplified(false);
        setEditing(null);
    };
    // a vaga simplificada exige login antes de abrir (o e-mail dele recebe os currículos); ao entrar, a lista é relida
    const openSimplified = () => {
        setChoosing(false);
        const logged: any = JnAjax.getLogin() || {};
        const open = () => {
            setSimplified(true);
            setEditing(null);
        };
        if (logged.email) return open();
        JnAjax.getHandler401(() => {
            load();
            open();
        })();
    };
    const closeForm = () => {
        setEditing(undefined);
        setSimplified(false);
    };

    // fechar o modal de login aberto por aqui só fecha o modal: a tela continua aberta, sem login
    const openLogin = () => {
        ModalLoginStore.getState().setDismissAction(null);
        JnAjax.getHandler401(load)();
    };

    // o modal continua aberto depois de gravar (vai para a aba dos currículos encontrados): só a lista muda; quem
    // salvou sem ter a lista (fez o login para salvar) passa a ver as suas vagas
    const saved = (position: Position) => {
        setPositions((current) => replacePosition(current, position));
        if (situation == 'loaded') return;
        savedBeforeTheList.current = [...savedBeforeTheList.current, position];
        load();
    };

    const reactivated = (title: string, expiration: { min: any; max: any }) => {
        setPositions(changeExpiration(positions, title, expiration));
        setReactivating(null);
    };

    const confirm = (chosen: Confirmation) => () => {
        const texts = confirmations[chosen.kind];
        const title = chosen.position.title;
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            const changed = chosen.kind == 'delete' ? removePosition(positions, title) : changeExpiration(positions, title, response.expiration);
            setPositions(changed);
            notify({ summary: texts.header, detail: texts.done });
        };
        callbacks[404] = () => notify({ summary: 'Vaga não encontrada', detail: 'Esta vaga não está mais entre as suas.', severity: 'error' });
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            JnAjax.getHandler401(confirm(chosen))();
        };
        callbacks['onUnexpectedHttpStatus'] = () => notify({ summary: 'Não foi possível concluir', detail: 'Tente de novo em alguns instantes.', severity: 'error' });
        JnAjax.doAnAjaxRequest(`recruiter/{email}/positions/${texts.path}`, callbacks, 'POST', { title }, {}, 'http://localhost:8081');
    };

    const { active, expired } = splitByExpiration(positions);
    const chosenTexts = confirmation ? confirmations[confirmation.kind] : confirmations.delete;

    const grid = (gridTab: PositionsTab, gridPositions: Position[], emptyMessage: string) => (
        <PositionsGrid
            tab={gridTab}
            positions={gridPositions}
            emptyMessage={emptyMessage}
            onEdit={setEditing}
            onDelete={(position) => setConfirmation({ kind: 'delete', position })}
            onInactivate={(position) => setConfirmation({ kind: 'inactivate', position })}
            onReactivate={setReactivating}
        />
    );

    return (
        <div className="panel mt-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h5 className="text-lg font-semibold">Vagas</h5>
                {(situation == 'loaded' || situation == 'notLogged') && (
                    <button type="button" className="btn btn-primary" aria-haspopup="dialog" onClick={() => setChoosing(true)}>
                        Abrir nova vaga
                    </button>
                )}
            </div>
            {situation == 'notLogged' ? (
                <div>
                    Para ver as vagas que você cadastrou, você deve fazer{' '}
                    <a role="button" className="cursor-pointer font-semibold text-primary underline" onClick={openLogin}>
                        login
                    </a>
                </div>
            ) : situation != 'loaded' ? (
                <div>{messages[situation]}</div>
            ) : (
                <Tabs value={tab} onChange={(value) => setTab((value as PositionsTab) || 'active')}>
                    {/* numa tela estreita as abas rolam na horizontal em vez de quebrar o nome em duas linhas */}
                    <Tabs.List className="mb-5 flex-nowrap overflow-x-auto">
                        <Tabs.Tab value="active" className="whitespace-nowrap font-semibold">
                            Vagas dentro da expiração ({active.length})
                        </Tabs.Tab>
                        <Tabs.Tab value="expired" className="whitespace-nowrap font-semibold">
                            Vagas expiradas ({expired.length})
                        </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="active">{grid('active', active, 'Nenhuma vaga dentro da data de expiração. Use "Abrir nova vaga" para cadastrar uma.')}</Tabs.Panel>
                    <Tabs.Panel value="expired">{grid('expired', expired, 'Nenhuma vaga expirada.')}</Tabs.Panel>
                </Tabs>
            )}
            <Modal visible={choosing} setVisible={setChoosing} title="Abrir nova vaga" size="md">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="button" className="btn btn-primary flex-1" onClick={openComplete}>
                        Abrir vaga completa
                    </button>
                    <button type="button" className="btn btn-outline-primary flex-1" onClick={openSimplified}>
                        Abrir vaga simplificada
                    </button>
                </div>
            </Modal>
            <Modal
                visible={editing !== undefined}
                setVisible={(visible) => !visible && closeForm()}
                title={editing ? 'Editar vaga' : simplified ? 'Abrir vaga simplificada' : 'Abrir nova vaga'}
                size="90%"
                closeOnClickOutside={false}
                closeOnEscape={false}
            >
                {editing !== undefined && (
                    <PositionFormModal key={editing ? editing.title : simplified ? 'newSimplified' : 'new'} position={editing} simplified={editing == null && simplified} onSaved={saved} onCancel={closeForm} />
                )}
            </Modal>
            <Modal visible={reactivating != null} setVisible={(visible) => !visible && setReactivating(null)} title="Reativar vaga" size="md">
                {reactivating && <ReactivatePositionForm key={reactivating.title} position={reactivating} onReactivated={reactivated} onCancel={() => setReactivating(null)} />}
            </Modal>
            <ConfirmModal
                visible={confirmation != null}
                onHide={() => setConfirmation(null)}
                header={chosenTexts.header}
                message={chosenTexts.message}
                danger={chosenTexts.danger}
                accept={confirmation ? confirm(confirmation) : () => {}}
            />
        </div>
    );
};
