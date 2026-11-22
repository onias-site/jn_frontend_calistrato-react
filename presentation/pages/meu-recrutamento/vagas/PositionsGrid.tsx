'use client';
import React, { useState } from 'react';
import { GridPagination, paginate } from '@/presentation/components/source/GridPagination';
import { Position, dateTimeLabel, foundResumesLabel } from './positionsData';

export type PositionsTab = 'active' | 'expired';

type PositionsGridProps = {
    tab: PositionsTab;
    positions: Position[];
    emptyMessage: string;
    onEdit: (position: Position) => void;
    onDelete: (position: Position) => void;
    onInactivate: (position: Position) => void;
    onReactivate: (position: Position) => void;
};

/**
 * O grid de uma aba da tela "Meu Recrutamento → Vagas" (desde 2026-11-21): título, data de expirar e as ações. Na aba das
 * vagas dentro da expiração: Editar, Excluir e Inativar; na das expiradas: Editar e Reativar. O botão dos currículos
 * encontrados aparece nas duas, ainda desligado (a busca dos currículos de uma vaga vem depois).
 */
export const PositionsGrid = ({ tab, positions, emptyMessage, onEdit, onDelete, onInactivate, onReactivate }: PositionsGridProps) => {
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
                            <tr key={position.title}>
                                <td className="max-w-md break-words">{position.title}</td>
                                <td className="whitespace-nowrap">{dateTimeLabel(position.expiration.max)}</td>
                                <td>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        <button type="button" className={action} aria-haspopup="dialog" onClick={() => onEdit(position)}>
                                            Editar
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
                                        <button type="button" className="cursor-not-allowed whitespace-nowrap text-white-dark" disabled title="Em breve">
                                            {foundResumesLabel()}
                                        </button>
                                    </div>
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
