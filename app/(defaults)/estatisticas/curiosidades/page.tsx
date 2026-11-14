import PageTitle from '@/presentation/layouts/page-title';
import { Curiosities } from '@/presentation/pages/estatisticas/curiosidades/Curiosities';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Curiosidades',
};

const EstatisticasCuriosidades = () => {
    return (
        <div>
            <PageTitle>Curiosidades</PageTitle>
            <Curiosities />
        </div>
    );
};

export default EstatisticasCuriosidades;
