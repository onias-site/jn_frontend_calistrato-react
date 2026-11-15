'use client';
import React, { useEffect, useState } from 'react';
import { GridPagination, paginate } from '@/presentation/components/source/GridPagination';
import { ViewedResume } from './viewedResumesData';

type ViewedResumesGridProps = {
    views: ViewedResume[];
    // o texto mostrado quando a aba não tem nenhum currículo no mês
    emptyMessage: string;
    // o título acima do grid, no singular e no plural, com a quantidade na frente
    singularTitle: string;
    pluralTitle: string;
    onSelect: (view: ViewedResume) => void;
};

/**
 * O grid de uma aba da tela de currículos visualizados: apelido, data da última visualização e "ver detalhes", paginado no
 * navegador. Cada nova lista (troca de mês) volta à primeira página.
 */
export const ViewedResumesGrid = ({ views, emptyMessage, singularTitle, pluralTitle, onSelect }: ViewedResumesGridProps) => {
    const [page, setPage] = useState(1);

    useEffect(() => setPage(1), [views]);

    if (views.length == 0) {
        return <div>{emptyMessage}</div>;
    }

    const { pageRows } = paginate(views, page);

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
                            <th>Última visualização</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.map((view) => (
                            <tr key={view.linkedinHash}>
                                <td>{view.alias}</td>
                                <td>{view.date}</td>
                                <td>
                                    <button type="button" className="whitespace-nowrap text-primary hover:underline" aria-haspopup="dialog" onClick={() => onSelect(view)}>
                                        ver detalhes
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <GridPagination total={views.length} page={page} onChange={setPage} />
        </>
    );
};
