import PageTitle from '@/presentation/layouts/page-title';
import { ResumesSearch } from '@/presentation/pages/curriculos/buscar/ResumesSearch';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Buscar',
};

// Currículos -> Buscar (desde 2026-11-25): os filtros de contagem de currículos do cadastro de vagas, com a contagem e a
// lista dos currículos encontrados; o id dos filtros vai no endereço (?filtro=<id>)
const CurriculosBuscar = () => {
    return (
        <div>
            <PageTitle>Buscar</PageTitle>
            <ResumesSearch />
        </div>
    );
};

export default CurriculosBuscar;
