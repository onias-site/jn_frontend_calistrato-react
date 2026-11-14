import PageTitle from '@/presentation/layouts/page-title';
import { SupplyAndDemand } from '@/presentation/pages/estatisticas/oferta-x-demanda/SupplyAndDemand';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Oferta X Demanda',
};

const EstatisticasOfertaXDemanda = () => {
    return (
        <div>
            <PageTitle>Oferta X Demanda</PageTitle>
            <SupplyAndDemand />
        </div>
    );
};

export default EstatisticasOfertaXDemanda;
