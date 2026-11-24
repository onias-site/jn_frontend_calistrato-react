import { PositionsOfTheResume } from '@/presentation/pages/meus-dados/vagas/PositionsOfTheResume';
import { Metadata } from 'next';
import PageTitle from '@/presentation/layouts/page-title';
import React from 'react';

export const metadata: Metadata = {
    title: 'Minhas vagas',
};

const MinhasVagas = () => {
    return (
        <div>
            <PageTitle>Minhas vagas</PageTitle>
            <PositionsOfTheResume />
        </div>
    );
};

export default MinhasVagas;