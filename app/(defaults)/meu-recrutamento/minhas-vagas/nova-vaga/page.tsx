
import CadastrarNovaVaga from '@/presentation/modules/MeuRecrutamento/MinhasVagas/application/NovaVaga/formulario-vaga';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Nova vaga',
};

const NovaVaga = () => {
    return <CadastrarNovaVaga />;
};

export default NovaVaga;
