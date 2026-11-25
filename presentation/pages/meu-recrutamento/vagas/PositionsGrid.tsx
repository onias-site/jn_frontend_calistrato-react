'use client';
import React, { useState } from 'react';
import { GridPagination, paginate } from '@/presentation/components/source/GridPagination';
import { Position, dateTimeLabel, foundResumesLabel, positionKey } from './positionsData';

export type PositionsTab = 'active' | 'expired' | 'deleted';

type PositionsGridProps = {
    tab: PositionsTab;
    positions: Position[];
    emptyMessage: string;
    onEdit: (position: Position) => void;
    // "Ver os currículos encontrados": o modal da vaga aberto na aba "Currículos aderentes"
    onSeeTheResumes: (position: Position) => void;
    // "Copiar": o modal de criação com os dados desta vaga, para uma vaga nova
    onCopy: (position: Position) => void;
    onDelete: (position: Position) => void;
    onInactivate: (position: Position) => void;
    onReactivate: (position: Position) => void;
    onRestore: (position: Position) => void;
    // o título da vaga que está sendo restaurada: o botão dela fica desligado até a resposta
    restoring?: string | null;
};

/**
 * O grid de uma aba da tela "Meu Recrutamento → Vagas" (desde 2026-11-21): título, data de expirar e as ações. Na aba das
 * vagas dentro da expiração: Editar, Excluir e Inativar; na das expiradas: Editar e Reativar. O botão dos currículos
 * encontrados aparece nas duas, ainda desligado (a busca dos currículos de uma vaga vem depois). Na das excluídas (desde
 * 2026-11-24, as vagas da gêmea vis_inactive_position), só Restaurar: a vaga volta valendo de hoje até uma semana depois.
 */
export const PositionsGrid = ({ tab, positions, emptyMessage, onEdit, onSeeTheResumes, onCopy, onDelete, onInactivate, onReactivate, onRestore, restoring }: PositionsGridProps) => {
    const [page, setPage] = useState(1);

    if (positions.length == 0) {
        return <div>{emptyMessage}</div>;
    }

    const { pageRows } = paginate(positions, page);
    const action = 'whitespace-nowrap text-primary hover:underline';

    return (
        <>
            <div className="table-responsive">
                <table className="table-hover">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Data de expirar</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.map((position) => (
                            <tr key={positionKey(position)}>
                                <td className="max-w-md break-words">{position.title}</td>
                                <td className="whitespace-nowrap">{dateTimeLabel(position.expiration.max)}</td>
                                <td>
                                    {tab == 'deleted' && (
                                        <button type="button" className={action} disabled={restoring == positionKey(position)} onClick={() => onRestore(position)}>
                                            {restoring == positionKey(position) ? 'Restaurando...' : 'Restaurar'}
                                        </button>
                                    )}
                                    {tab != 'deleted' && (
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        <button type="button" className={action} aria-haspopup="dialog" onClick={() => onEdit(position)}>
                                            Editar
                                        </button>
                                        <button type="button" className={action} aria-haspopup="dialog" title="Abre uma vaga nova com os dados desta, que fica como está" onClick={() => onCopy(position)}>
                                            Copiar
                                        </button>
                                        {tab == 'active' && (
                                            <button type="button" className={action} aria-haspopup="dialog" onClick={() => onDelete(position)}>
                                                Excluir
                                            </button>
                                        )}
                                        {tab == 'active' && (
                                            <button type="button" className={action} aria-haspopup="dialog" onClick={() => onInactivate(position)}>
                                                Inativar
                                            </button>
                                        )}
                                        {tab == 'expired' && (
                                            <button type="button" className={action} aria-haspopup="dialog" onClick={() => onReactivate(position)}>
                                                Reativar
                                            </button>
                                        )}
                                        <button type="button" className={`${action} whitespace-nowrap`} aria-haspopup="dialog" onClick={() => onSeeTheResumes(position)}>
                                            {foundResumesLabel()}
                                        </button>
                                    </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <GridPagination total={positions.length} page={page} onChange={setPage} />
        </>
    );
};
