'use client';
import React from 'react';
import { ResumesOfTheWeek, SeeAllList } from '../curriculos-da-semana/ResumesOfTheWeek';
import {
    getPositionTitleFromQuery,
    getResumesOfThePositionGridTitle,
    getResumesOfThePositionPath,
    getResumesOfThePositionTitle,
} from './positionSeeAll';

const resumesOfThePositionList: SeeAllList = {
    path: (search) => getResumesOfThePositionPath(getPositionTitleFromQuery(search)),
    title: (search, owner) => getResumesOfThePositionTitle(getPositionTitleFromQuery(search), owner),
    noEmail: 'Não há e-mail de currículos desta vaga seu do último mês. A lista completa fica disponível por um mês após cada e-mail.',
    checkboxId: 'resumesOfThePositionOnlyNotViewed',
    gridTitle: getResumesOfThePositionGridTitle,
};

/**
 * A tela "Ver todos" do e-mail "{n} Cvs recebidos para a vaga" (desde 2026-11-24): a tela dos currículos da semana
 * (login do destinatário, grid paginado, filtro dos não vistos) com a lista do último e-mail da vaga do link.
 */
export const ResumesOfThePosition = () => <ResumesOfTheWeek list={resumesOfThePositionList} />;