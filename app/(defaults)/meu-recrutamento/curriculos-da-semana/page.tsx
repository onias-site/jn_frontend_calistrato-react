import { ResumesOfTheWeek } from '@/presentation/pages/meu-recrutamento/curriculos-da-semana/ResumesOfTheWeek';
import { Metadata } from 'next';
import PageTitle from '@/presentation/layouts/page-title';
import React from 'react';

export const metadata: Metadata = {
    title: 'Currículos da semana',
};

const CurriculosDaSemana = () => {
    return (
        <div>
            <PageTitle>Currículos da semana</PageTitle>
            <ResumesOfTheWeek />
        </div>
    );
};

export default CurriculosDaSemana;
