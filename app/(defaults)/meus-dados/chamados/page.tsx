import { Tickets } from '@/presentation/pages/meus-dados/chamados/Tickets';
import { Metadata } from 'next';
import PageTitle from '@/presentation/layouts/page-title';
import React from 'react';

export const metadata: Metadata = {
    title: 'Chamados',
};

const Chamados = () => {
    return (
        <div>
            <PageTitle>Chamados</PageTitle>
            <Tickets />
        </div>
    );
};

export default Chamados;
