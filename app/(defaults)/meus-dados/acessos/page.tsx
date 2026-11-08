import { LoginHistory } from '@/presentation/pages/meus-dados/acessos/LoginHistory';
import { Metadata } from 'next';
import PageTitle from '@/presentation/layouts/page-title';
import React from 'react';

export const metadata: Metadata = {
    title: 'Acessos',
};

const Acessos = () => {
    return (
        <div>
            <PageTitle>Acessos</PageTitle>
            <LoginHistory />
        </div>
    );
};

export default Acessos;
