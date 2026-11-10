'use client';
import React from 'react';
import { Pagination } from '@mantine/core';
import { GRID_PAGE_SIZE, paginate } from './paginate';

export { GRID_PAGE_SIZE, paginate };

/** O rodapé de um grid paginado: "1 a 10 de 37" à esquerda e, havendo mais de uma página, os botões de página à direita. */
export const GridPagination = ({ total, page, onChange, pageSize = GRID_PAGE_SIZE }: { total: number; page: number; onChange: (page: number) => void; pageSize?: number }) => {
    if (total == 0) return null;
    const { totalPages, currentPage, first } = paginate(new Array(total), page, pageSize);
    const last = Math.min(first + pageSize, total);
    return (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-white-dark">
            <span>
                {first + 1} a {last} de {total}
            </span>
            {totalPages > 1 && <Pagination total={totalPages} value={currentPage} onChange={onChange} size="sm" />}
        </div>
    );
};
