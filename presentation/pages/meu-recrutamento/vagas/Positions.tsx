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
import { Position, changeExpiration, keyBodyOf, parsePositionsOnBothSides, positionKey, removePosition, replacePosition, splitByExpiration } from './positionsData';

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
        message: 'A vaga será excluída e passará para a aba "Vagas excluídas", de onde pode ser restaurada. Deseja continuar?',
        done: 'A vaga foi para a aba "Vagas excluídas".',
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
 * <p>
 * Desde 2026-11-24 há a terceira aba, "Vagas excluídas": as vagas da gêmea vis_inactive_position, lidas do mesmo grupo
 * nos dois lados (grouper/.../bothSides: jn_grouper e jn_inactive_grouper). "Restaurar" a devolve valendo do começo de hoje
 * até o fim do dia uma semana depois; se já houver uma vaga não excluída com o mesmo título, a restaurada ganha "título 2".
 */
export const Positions = () => {
    const [situation, setSituation] = useState<Situation>('loading');
    const [positions, setPositions] = useState<Position[]>([]);
    const [deleted, setDeleted] = useState<Position[]>([]);
    const [restoring, setRestoring] = useState<string | null>(null);
    const [tab, setTab] = useState<PositionsTab>('active');
    // undefined: modal fechado; null: "Abrir nova vaga"; uma vaga: "Editar"
    const [editing, setEditing] = useState<Position | null | undefined>(undefined);
    // "Abrir nova vaga" (desde 2026-11-24) abre a escolha entre a vaga completa e a simplificada
    const [choosing, setChoosing] = useState(false);
    const [simplified, setSimplified] = useState(false);
    // o modal da vaga aberto pelo link "Ver os currículos encontrados": já na aba "Currículos aderentes"
    const [openOnResumes, setOpenOnResumes] = useState(false);
    // "Copiar": a vaga usada como molde de uma vaga nova (editing fica null, como em "Abrir nova vaga")
    const [template, setTemplate] = useState<Position | null>(null);
    const [reactivating, setReactivating] = useState<Position | null>(null);
    const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
    // as vagas gravadas antes de a lista chegar do backend (ex.: a primeira, salva por quem fez o login só para salvar):
    // a gravação é assíncrona e o grupo lido logo depois ainda pode vir sem elas
    const savedBeforeTheList = useRef<Position[]>([]);

    const withTheSaved = (loaded: Position[]) => savedBeforeTheList.current.reduce((list, saved) => replacePosition(list, saved), loaded);

    const load = () => {
        setSituation('loading');
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            const sides = parsePositionsOnBothSides(response);
            const loaded = withTheSaved(sides.positions);
            setPositions(loaded);
            // uma vaga gravada depois de excluída sai da gêmea: não fica nas duas listas
            setDeleted(sides.deleted.filter((position) => !loaded.some((saved) => positionKey(saved) == positionKey(position))));
            setSituation('loaded');
        };
        // nenhuma vaga ainda: o grupo do usuário não existe
        callbacks[404] = () => {
            setPositions(withTheSaved([]));
            setDeleted([]);
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
        // os dois lados do grupo numa leitura só: as vagas (jn_grouper) e as excluídas (jn_inactive_grouper)
        JnAjax.doACachedRequest(`grouper/{email}/${PARENT_NAME}/${CHILD_NAME}/${parentId}/bothSides`, callbacks, 'GET', null as any, {}, 'http://localhost:8082');
    };

    useEffect(load, []);

    const openComplete = () => {
        setChoosing(false);
        setSimplified(false);
        setTemplate(null);
        setEditing(null);
    };
    // a vaga simplificada exige login antes de abrir (o e-mail dele recebe os currículos); ao entrar, a lista é relida
    const openSimplified = () => {
        setChoosing(false);
        const logged: any = JnAjax.getLogin() || {};
        const open = () => {
            setSimplified(true);
            setTemplate(null);
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
        setOpenOnResumes(false);
        setTemplate(null);
    };
    const edit = (position: Position) => {
        setOpenOnResumes(false);
        setTemplate(null);
        setEditing(position);
    };
    const seeTheResumes = (position: Position) => {
        setOpenOnResumes(true);
        setTemplate(null);
        setEditing(position);
    };
    const copy = (position: Position) => {
        setOpenOnResumes(false);
        setSimplified(false);
        setTemplate(position);
        setEditing(null);
    };

    // fechar o modal de login aberto por aqui só fecha o modal: a tela continua aberta, sem login
    const openLogin = () => {
        ModalLoginStore.getState().setDismissAction(null);
        JnAjax.getHandler401(load)();
    };

    // o modal continua aberto depois de gravar (vai para a aba dos currículos encontrados): só a lista muda; quem
    // salvou sem ter a lista (fez o login para salvar) passa a ver as suas vagas
    // replacedKey: a chave anterior da vaga, quando a edição mudou o título (desde 2026-11-24 a de título antigo some)
    const saved = (position: Position, replacedKey: string) => {
        setPositions((current) => replacePosition(current, position, replacedKey));
        // gravar uma chave que estava entre as excluídas tira a excluída da gêmea
        setDeleted((current) => removePosition(current, positionKey(position)));
        if (situation == 'loaded') return;
        savedBeforeTheList.current = [...savedBeforeTheList.current, position];
        load();
    };

    const reactivated = (key: string, expiration: { min: any; max: any }) => {
        setPositions(changeExpiration(positions, key, expiration));
        setReactivating(null);
    };

    const confirm = (chosen: Confirmation) => () => {
        const texts = confirmations[chosen.kind];
        const key = positionKey(chosen.position);
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            const changed = chosen.kind == 'delete' ? removePosition(positions, key) : changeExpiration(positions, key, response.expiration);
            setPositions(changed);
            // a excluída vai para a aba das excluídas
            chosen.kind == 'delete' && setDeleted((current) => replacePosition(current, chosen.position));
            notify({ summary: texts.header, detail: texts.done });
        };
        callbacks[404] = () => notify({ summary: 'Vaga não encontrada', detail: 'Esta vaga não está mais entre as suas.', severity: 'error' });
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            JnAjax.getHandler401(confirm(chosen))();
        };
        callbacks['onUnexpectedHttpStatus'] = () => notify({ summary: 'Não foi possível concluir', detail: 'Tente de novo em alguns instantes.', severity: 'error' });
        JnAjax.doAnAjaxRequest(`recruiter/{email}/positions/${texts.path}`, callbacks, 'POST', keyBodyOf(chosen.position), {}, 'http://localhost:8081');
    };

    // "Restaurar" (desde 2026-11-24): a vaga sai das excluídas e volta valendo por uma semana, com o título que o backend
    // devolveu (o mesmo, ou "título 2" quando já há uma vaga não excluída com ele)
    const restore = (position: Position) => {
        setRestoring(positionKey(position));
        const callbacks: any = {};
        callbacks[200] = (response: any) => {
            setRestoring(null);
            const restored: Position = { ...position, title: response.title, expiration: { min: Number(response.expiration.min), max: Number(response.expiration.max) } };
            setDeleted((current) => removePosition(current, positionKey(position)));
            setPositions((current) => replacePosition(current, restored));
            const renamed = response.title != position.title ? ` Como você já tinha uma vaga com este título, ela foi restaurada como "${response.title}".` : '';
            notify({ summary: 'Vaga restaurada', detail: `A vaga voltou para a aba "Vagas dentro da expiração", valendo até ${new Date(restored.expiration.max).toLocaleDateString('pt-BR')}.${renamed}` });
        };
        callbacks[404] = () => {
            setRestoring(null);
            notify({ summary: 'Vaga não encontrada', detail: 'Esta vaga não está mais entre as suas vagas excluídas.', severity: 'error' });
        };
        callbacks[401] = () => {
            // sem login o JnAjax chama o 401 antes de enviar, e não desliga o carregamento que já ligou
            JnAjax.setNotLoading()();
            setRestoring(null);
            JnAjax.getHandler401(() => restore(position))();
        };
        callbacks['onUnexpectedHttpStatus'] = () => {
            setRestoring(null);
            notify({ summary: 'Não foi possível restaurar', detail: 'Tente de novo em alguns instantes.', severity: 'error' });
        };
        JnAjax.doAnAjaxRequest('recruiter/{email}/positions/restore', callbacks, 'POST', keyBodyOf(position), {}, 'http://localhost:8081');
    };

    const { active, expired } = splitByExpiration(positions);
    const chosenTexts = confirmation ? confirmations[confirmation.kind] : confirmations.delete;

    const grid = (gridTab: PositionsTab, gridPositions: Position[], emptyMessage: string) => (
        <PositionsGrid
            tab={gridTab}
            positions={gridPositions}
            emptyMessage={emptyMessage}
            onEdit={edit}
            onSeeTheResumes={seeTheResumes}
            onCopy={copy}
            onDelete={(position) => setConfirmation({ kind: 'delete', position })}
            onInactivate={(position) => setConfirmation({ kind: 'inactivate', position })}
            onReactivate={setReactivating}
            onRestore={restore}
            restoring={restoring}
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
                        <Tabs.Tab value="deleted" className="whitespace-nowrap font-semibold">
                            Vagas excluídas ({deleted.length})
                        </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="active">{grid('active', active, 'Nenhuma vaga dentro da data de expiração. Use "Abrir nova vaga" para cadastrar uma.')}</Tabs.Panel>
                    <Tabs.Panel value="expired">{grid('expired', expired, 'Nenhuma vaga expirada.')}</Tabs.Panel>
                    <Tabs.Panel value="deleted">{grid('deleted', deleted, 'Nenhuma vaga excluída.')}</Tabs.Panel>
                </Tabs>
            )}
            <Modal visible={choosing} setVisible={setChoosing} title="Abrir nova vaga" size="lg">
                {/* a diferença entre os dois cadastros (desde 2026-11-24), para o usuário escolher antes de abrir */}
                <div className="mb-5 space-y-3 text-sm">
                    <p>
                        <strong>Vaga completa:</strong> você passa por todas as abas e decide cada detalhe: as habilidades obrigatórias e desejáveis (vaga de tecnologia),
                        os idiomas, as regiões, as senioridades, a disponibilidade para começar, o trabalho temporário, as faixas salariais, como e com que frequência receber
                        os currículos, a divulgação nos grupos e a ordem em que os currículos aparecem.
                    </p>
                    <p>
                        <strong>Vaga simplificada:</strong> você preenche só a vaga (título, área, descrição, contatos e período) e os salários; o resto já vem
                        preenchido: todas as senioridades, todas as regiões mais o home office, nenhum idioma exigido, as habilidades encontradas na descrição como
                        obrigatórias, os próprios candidatos enviando os currículos para o seu e-mail e a vaga divulgada nos grupos. Exige login. Depois, você pode
                        editá-la como uma vaga completa.
                    </p>
                </div>
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
                title={editing ? 'Editar vaga' : template ? `Nova vaga copiada de "${template.title}"` : simplified ? 'Abrir vaga simplificada' : 'Abrir nova vaga'}
                size="90%"
                closeOnClickOutside={false}
                closeOnEscape={false}
            >
                {editing !== undefined && (
                    <PositionFormModal key={editing ? positionKey(editing) : template ? `copy-${positionKey(template)}` : simplified ? 'newSimplified' : 'new'} position={editing} simplified={editing == null && simplified} openOnResumes={openOnResumes} template={template} onSaved={saved} onCancel={closeForm} />
                )}
            </Modal>
            <Modal visible={reactivating != null} setVisible={(visible) => !visible && setReactivating(null)} title="Reativar vaga" size="md">
                {reactivating && <ReactivatePositionForm key={positionKey(reactivating)} position={reactivating} onReactivated={reactivated} onCancel={() => setReactivating(null)} />}
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
