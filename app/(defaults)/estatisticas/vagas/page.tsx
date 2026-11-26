import PageTitle from '@/presentation/layouts/page-title';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Vagas',
};

const EstatisticasVagas = () => {
    return (
        <div>
            <PageTitle>Vagas</PageTitle>
        </div>
    );
};

export default EstatisticasVagas;
