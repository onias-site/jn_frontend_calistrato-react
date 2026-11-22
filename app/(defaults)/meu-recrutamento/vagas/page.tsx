import { Positions } from '@/presentation/pages/meu-recrutamento/vagas/Positions';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Vagas',
};

const PositionsPage = () => {
    return <Positions />;
};

export default PositionsPage;
