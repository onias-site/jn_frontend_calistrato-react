'use client';
import React, { useState } from 'react';
import { Checkbox } from '@mantine/core';
import { ResumeRowCells, ResumeRowHeaders } from './ResumeRowCells';
import { GridPagination, paginate } from '@/presentation/components/source/GridPagination';

/** Quantas linhas cada página da lista mostra. */
const PAGE_SIZE = 50;

type ResumeRowsGridProps = {
    // as linhas como o back end as monta (as colunas do e-mail de currículos, a última visualização, o rótulo e o token do link)
    resumes: any[];
    // o e-mail do recrutador logado: vai no link que abre o currículo, assinado para ele
    email: string;
    // o título acima do grid, com a quantidade da lista e, com o checkbox marcado, a das linhas que ficaram
    title: (total: number, shown: number, onlyNotViewed: boolean) => React.ReactNode;
    // o id do checkbox (único na página)
    checkboxId: string;
    // o texto do grid vazio: a lista sem nenhum currículo, ou todos já vistos com o checkbox marcado
    emptyMessage?: string;
};

/** O link que abre o currículo e grava a visualização: o token assina o e-mail do recrutador e o id do currículo. */
export const viewLinkOf = (email: string, resume: any) =>
    `/recrutador/ver-curriculo?email=${encodeURIComponent(email)}&resume=${encodeURIComponent(resume.resumeId)}&token=${encodeURIComponent(resume.token)}`;

/**
 * O grid de currículos do recrutador (desde 2026-11-22, extraído de "curriculos-da-semana" para servir também à lista dos
 * currículos que atendem aos filtros de uma vaga): as colunas do e-mail de currículos, a coluna "Datas e visualização" com
 * a última visualização do recrutador (em vermelho quando nunca viu) e o link que abre o currículo, a paginação no
 * navegador e o checkbox "Mostrar apenas os currículos que ainda não vi" (desmarcado ao abrir); a coluna # numera as
 * linhas que ficaram, na ordem da lista.
 */
export const ResumeRowsGrid = ({ resumes, email, title, checkboxId, emptyMessage = 'Você já viu todos os currículos desta lista.' }: ResumeRowsGridProps) => {
    const [page, setPage] = useState(1);
    const [onlyNotViewed, setOnlyNotViewed] = useState(false);

    const shownResumes = onlyNotViewed ? resumes.filter((resume) => !resume.viewed) : resumes;
    const { first, pageRows } = paginate(shownResumes, page, PAGE_SIZE);

    // marcar ou desmarcar muda a lista: volta à primeira página
    const changeOnlyNotViewed = (checked: boolean) => {
        setOnlyNotViewed(checked);
        setPage(1);
    };

    return (
        <>
            <h5 className="mb-4 text-lg font-semibold">{title(resumes.length, shownResumes.length, onlyNotViewed)}</h5>
            <Checkbox id={checkboxId} className="mb-4" label="Mostrar apenas os currículos que ainda não vi" checked={onlyNotViewed} onChange={(event) => changeOnlyNotViewed(event.currentTarget.checked)} />
            {shownResumes.length == 0 ? (
                <div>{emptyMessage}</div>
            ) : (
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th className="text-center">#</th>
                                <ResumeRowHeaders />
                                <th>Datas e visualização</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageRows.map((resume, pageIndex) => (
                                <tr key={resume.resumeId}>
                                    <td className="text-center align-top">{first + pageIndex + 1}</td>
                                    <ResumeRowCells resume={resume} />
                                    <td className="align-top">
                                        <div className={resume.viewed ? '' : 'font-semibold text-danger'}>{resume.lastView}</div>
                                        <a href={viewLinkOf(email, resume)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            {resume.viewLabel}
                                        </a>
                                        {resume.insertion && <div>{resume.insertion}</div>}
                                        {resume.lastChange && <div>{resume.lastChange}</div>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <GridPagination total={shownResumes.length} page={page} onChange={setPage} pageSize={PAGE_SIZE} />
        </>
    );
};
