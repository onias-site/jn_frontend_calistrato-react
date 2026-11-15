'use client';
import React, { useState } from 'react';
import { GRID_PAGE_SIZE, GridPagination, paginate } from '@/presentation/components/source/GridPagination';
import { ViewedResume } from './viewedResumesData';

type ViewedResumesGridProps = {
    views: ViewedResume[];
    // o texto mostrado quando a aba não tem nenhum currículo no mês
    emptyMessage: string;
    // o título acima do grid, no singular e no plural, com a quantidade na frente
    singularTitle: string;
    pluralTitle: string;
    // "Negativar CV" na aba Visualizados, "Positivar CV" na aba Indesejados
    moveLabel: string;
    // as linhas de cada página: 50 com "Listar todos" marcado, o padrão dos grids no mês
    pageSize?: number;
    onSelect: (view: ViewedResume) => void;
    onEdit: (view: ViewedResume) => void;
    onMove: (view: ViewedResume) => void;
};

/**
 * O grid de uma aba da tela de currículos visualizados: apelido, comentário, data da última visualização e as ações "ver
 * detalhes", "Editar detalhes" e a que troca o currículo de aba (desde 2026-11-15), paginado no navegador. Cada nova lista
 * (troca de mês, ou "Listar todos") volta à primeira página.
 */
export const ViewedResumesGrid = ({ views, emptyMessage, singularTitle, pluralTitle, moveLabel, pageSize = GRID_PAGE_SIZE, onSelect, onEdit, onMove }: ViewedResumesGridProps) => {
    // a troca de mês recria o grid (key do mês na tela) e volta à primeira página; negativar ou editar uma linha mantém a
    // página (o paginate limita à última, quando ela some)
    const [page, setPage] = useState(1);

    if (views.length == 0) {
        return <div>{emptyMessage}</div>;
    }

    const { pageRows } = paginate(views, page, pageSize);
    const action = 'whitespace-nowrap text-primary hover:underline';

    return (
        <>
            <h5 className="mb-4 text-lg font-semibold">
                {views.length} {views.length == 1 ? singularTitle : pluralTitle}
            </h5>
            <div className="table-responsive">
                <table className="table-hover">
                    <thead>
                        <tr>
                            <th>Apelido</th>
                            <th>Comentário</th>
                            <th>Última visualização</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.map((view) => (
                            <tr key={view.linkedinHash}>
                                <td>{view.alias}</td>
                                <td className="max-w-xs break-words">{view.comment || ''}</td>
                                <td>{view.date}</td>
                                <td>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        <button type="button" className={action} aria-haspopup="dialog" onClick={() => onSelect(view)}>
                                            ver detalhes
                                        </button>
                                        <button type="button" className={action} aria-haspopup="dialog" onClick={() => onEdit(view)}>
                                            Editar detalhes
                                        </button>
                                        <button type="button" className={action} aria-haspopup="dialog" onClick={() => onMove(view)}>
                                            {moveLabel}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <GridPagination total={views.length} page={page} onChange={setPage} pageSize={pageSize} />
        </>
    );
};
