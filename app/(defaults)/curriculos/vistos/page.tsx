import { ViewedResumesOfTheMonth } from '@/presentation/pages/meu-recrutamento/curriculos-visualizados/ViewedResumesOfTheMonth';
import { Metadata } from 'next';
import PageTitle from '@/presentation/layouts/page-title';
import React from 'react';

export const metadata: Metadata = {
    title: 'Currículos visualizados',
};

const CurriculosVisualizados = () => {
    return (
        <div>
            <PageTitle>Currículos visualizados</PageTitle>
            <ViewedResumesOfTheMonth />
        </div>
    );
};

export default CurriculosVisualizados;
