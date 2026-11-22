'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

const messages: Record<Exclude<Situation, 'loaded'>, string> = {
    loading: 'Carregando as suas vagas...',
    notLogged: 'Entre com o seu e-mail para ver as vagas que você cadastrou.',
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
 * da data de expiração e as expiradas, lidas por id no grupo do e-mail dele (jn_grouper). "Criar vaga" e "Editar" abrem
 * o mesmo modal (na edição o título fica travado, por ser parte da chave); "Excluir" (só nas vagas dentro da expiração)
 * manda a vaga para a gêmea, e ela some das duas abas; "Inativar" põe o fim da vaga um minuto antes de agora, e ela vai
 * para a aba das expiradas; "Reativar" pede o novo fim da vaga, e ela volta. As gravações são assíncronas no backend: a
 * tela atualiza a lista com o que enviou, e a lista guardada em memória é descartada (JnAjax.TICKET_WRITES).
 */
export const Positions = () => {
    const [situation, setSituation] = useState<Situation>('loading');
    const [positions, setPositions] = useState<Position[]>([]);
    const [tab, setTab] = useState<PositionsTab>('active');
    // undefined: modal fechado; null: "Criar vaga"; uma vaga: "Editar"
    const [editing, setEditing] = useState<Position | null | undefined>(undefined);
    const [reactivating, setReactivating] = useState<Position | null>(null);
    const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
    const router = useRouter();

    const load = () => {
        setSituation('loading');
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            setPositions(parsePositions(response));
            setSituation('loaded');
        };
        // nenhuma vaga ainda: o grupo do usuário não existe
        callbacks[404] = () => {
            setPositions([]);
            setSituation('loaded');
        };
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            setSituation('notLogged');
            // fechar o modal sem entrar leva à tela inicial: aqui ficaria só uma tela vazia
            ModalLoginStore.getState().setDismissAction(() => router.push('/'));
            JnAjax.getHandler401(load)();
        };
        callbacks['onUnexpectedHttpStatus'] = () => setSituation('error');
        const login: any = JnAjax.getLogin() || {};
        const parentId = login.email ? groupParentId(login.email) : '';
        // GET sem corpo: com {} o jQuery poria "?{}" na URL
        JnAjax.doACachedRequest(`grouper/{email}/${PARENT_NAME}/${CHILD_NAME}/${parentId}`, callbacks, 'GET', null as any, {}, 'http://localhost:8082');
    };

    useEffect(load, []);

    const saved = (position: Position) => {
        setPositions(replacePosition(positions, position));
        setEditing(undefined);
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
                {situation == 'loaded' && (
                    <button type="button" className="btn btn-primary" aria-haspopup="dialog" onClick={() => setEditing(null)}>
                        Criar vaga
                    </button>
                )}
            </div>
            {situation != 'loaded' ? (
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
                    <Tabs.Panel value="active">{grid('active', active, 'Nenhuma vaga dentro da data de expiração. Use "Criar vaga" para cadastrar uma.')}</Tabs.Panel>
                    <Tabs.Panel value="expired">{grid('expired', expired, 'Nenhuma vaga expirada.')}</Tabs.Panel>
                </Tabs>
            )}
            <Modal visible={editing !== undefined} setVisible={(visible) => !visible && setEditing(undefined)} title={editing ? 'Editar vaga' : 'Criar vaga'} size="xl">
                {editing !== undefined && <PositionFormModal key={editing ? editing.title : 'new'} position={editing} onSaved={saved} onCancel={() => setEditing(undefined)} />}
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
